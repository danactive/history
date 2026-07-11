import { serializeMessage } from '@modelcontextprotocol/server'
import { spawn, type ChildProcessWithoutNullStreams } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { afterEach, describe, expect, test } from 'vitest'
import { Gallery } from '../src/lib/galleries'
import { Item } from '../src/types/common'

type JsonRpcSuccess = {
  jsonrpc: '2.0'
  id?: string | number | null
  result?: unknown
  error?: {
    code: number
    message: string
    data?: unknown
  }
  method?: string
  params?: unknown
}

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const serverEntry = path.join(projectRoot, 'mcp', 'storytelling.ts')
const tsxBin = path.join(projectRoot, 'node_modules', '.bin', 'tsx')

class McpStdioClient {
  private nextId = 1
  private readonly pending = new Map<number, {
    resolve: (value: JsonRpcSuccess) => void
    reject: (reason?: unknown) => void
  }>()
  private stdoutBuffer = ''
  private stderrBuffer = ''

  constructor(private readonly child: ChildProcessWithoutNullStreams) {
    child.stdout.setEncoding('utf8')
    child.stderr.setEncoding('utf8')

    child.stdout.on('data', (chunk: string) => {
      this.stdoutBuffer += chunk
      const lines = this.stdoutBuffer.split('\n')
      this.stdoutBuffer = lines.pop() ?? ''

      lines
        .map(line => line.trim())
        .filter(Boolean)
        .forEach((line) => {
          const message = JSON.parse(line) as JsonRpcSuccess
          if (typeof message.id === 'number') {
            const resolver = this.pending.get(message.id)
            if (resolver) {
              this.pending.delete(message.id)
              resolver.resolve(message)
            }
          }
        })
    })

    child.stderr.on('data', (chunk: string) => {
      this.stderrBuffer += chunk
    })

    child.on('exit', (code, signal) => {
      const error = new Error(
        `MCP server exited unexpectedly with code ${code ?? 'null'} signal ${signal ?? 'null'}${this.stderrBuffer ? `\n${this.stderrBuffer}` : ''}`,
      )
      this.pending.forEach(({ reject }) => reject(error))
      this.pending.clear()
    })
  }

  async initialize() {
    const response = await this.request('initialize', {
      protocolVersion: '2025-11-05',
      capabilities: {},
      clientInfo: {
        name: 'vitest-mcp-client',
        version: '1.0.0',
      },
    })

    expect(response.result).toBeDefined()

    this.notify('notifications/initialized', {})
  }

  async callTool(name: string, args: Record<string, unknown>) {
    const response = await this.request('tools/call', {
      name,
      arguments: args,
    })

    if (response.error) {
      throw new Error(`Tool call failed: ${response.error.message}`)
    }

    return response.result as {
      content?: { type: string, text?: string }[]
      structuredContent?: Record<string, unknown>
    }
  }

  private async request(method: string, params: Record<string, unknown>) {
    const id = this.nextId++
    const payload = serializeMessage({
      jsonrpc: '2.0',
      id,
      method,
      params,
    })

    const result = new Promise<JsonRpcSuccess>((resolve, reject) => {
      this.pending.set(id, { resolve, reject })
    })

    this.child.stdin.write(payload)
    return result
  }

  private notify(method: string, params: Record<string, unknown>) {
    this.child.stdin.write(serializeMessage({
      jsonrpc: '2.0',
      method,
      params,
    }))
  }
}

const childProcesses: ChildProcessWithoutNullStreams[] = []

function startStorytellingServer() {
  const child = spawn(tsxBin, [serverEntry], {
    cwd: projectRoot,
    stdio: 'pipe',
  })
  childProcesses.push(child)
  return new McpStdioClient(child)
}

afterEach(() => {
  while (childProcesses.length > 0) {
    const child = childProcesses.pop()
    if (child && !child.killed) {
      child.kill()
    }
  }
})

describe('storytelling MCP server integration', () => {
  test('executes a real location query against committed demo data', async () => {
    const client = startStorytellingServer()

    await client.initialize()

    const result = await client.callTool('search_story_moments', {
      gallery: 'demo',
      country: 'Canada',
      limit: 5,
    })

    const structured = result.structuredContent as {
      summary: string
      matches: Array<{ city: Item['city'], filename: Item['filename'] }>
      filtersApplied: { gallery: Gallery | null, country: string | null, region: string | null }
    }

    expect(structured.filtersApplied).toEqual(expect.objectContaining({
      gallery: 'demo',
      country: 'Canada',
      region: null,
    }))
    expect(structured.summary).toMatch(/Found \d+ story candidate/)
    expect(structured.matches.length).toBeGreaterThan(0)
    expect(structured.matches.every(match => match.city.includes('Canada'))).toBe(true)
  }, 20000)
})
