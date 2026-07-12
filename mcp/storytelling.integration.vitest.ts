import { serializeMessage } from '@modelcontextprotocol/server'
import { spawn, type ChildProcessWithoutNullStreams } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { afterEach, describe, expect, test } from 'vitest'
import * as z from 'zod/v4'

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

const jsonRpcErrorSchema = z.object({
  code: z.number(),
  message: z.string(),
  data: z.unknown().optional(),
})

const jsonRpcSuccessSchema = z.object({
  jsonrpc: z.literal('2.0'),
  id: z.union([z.string(), z.number(), z.null()]).optional(),
  result: z.unknown().optional(),
  error: jsonRpcErrorSchema.optional(),
  method: z.string().optional(),
  params: z.unknown().optional(),
})

const initializeResultSchema = z.object({
  protocolVersion: z.string(),
  serverInfo: z.object({
    name: z.string(),
    version: z.string(),
  }),
  capabilities: z.record(z.string(), z.unknown()).optional(),
})

const listToolsResultSchema = z.object({
  tools: z.array(z.object({
    name: z.string(),
    title: z.string().optional(),
    description: z.string().optional(),
    inputSchema: z.unknown().optional(),
  })),
})

const toolCallResultSchema = z.object({
  content: z.array(z.object({
    type: z.string(),
    text: z.string().optional(),
  })).optional(),
  structuredContent: z.record(z.string(), z.unknown()).optional(),
})

const albumListStructuredSchema = z.object({
  albums: z.array(z.object({
    name: z.string(),
  })),
})

const summaryStructuredSchema = z.object({
  summary: z.string(),
})

const searchStructuredSchema = z.object({
  summary: z.string(),
  matches: z.array(z.object({
    city: z.string(),
    filename: z.union([z.string(), z.array(z.string())]),
  })),
  filtersApplied: z.object({
    gallery: z.string().nullable(),
    country: z.string().nullable(),
    region: z.string().nullable(),
  }),
})

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
          const message = jsonRpcSuccessSchema.parse(JSON.parse(line))
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

    return initializeResultSchema.parse(response.result)
  }

  async listTools() {
    const response = await this.request('tools/list', {})

    if (response.error) {
      throw new Error(`Tool listing failed: ${response.error.message}`)
    }

    return listToolsResultSchema.parse(response.result)
  }

  async callTool(name: string, args: Record<string, unknown>) {
    const response = await this.request('tools/call', {
      name,
      arguments: args,
    })

    if (response.error) {
      throw new Error(`Tool call failed: ${response.error.message}`)
    }

    return toolCallResultSchema.parse(response.result)
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
  test('completes stdio handshake and advertises capabilities', async () => {
    const client = startStorytellingServer()

    const result = await client.initialize()

    expect(result.serverInfo).toEqual({
      name: 'history-storytelling',
      version: '1.0.0',
    })
    expect(result.protocolVersion).toBeTruthy()
    expect(result.capabilities).toEqual(expect.objectContaining({
      tools: expect.any(Object),
      prompts: expect.any(Object),
      resources: expect.any(Object),
    }))
  }, 20000)

  test('lists storytelling tools for client exploration', async () => {
    const client = startStorytellingServer()

    await client.initialize()
    const result = await client.listTools()

    expect(result.tools.map(tool => tool.name)).toEqual(expect.arrayContaining([
      'list_galleries',
      'list_albums',
      'search_story_moments',
      'get_album_story',
      'get_people_story_index',
      'get_on_this_day_story',
    ]))
    expect(result.tools.find(tool => tool.name === 'search_story_moments')).toEqual(expect.objectContaining({
      title: 'Search Story Moments',
      description: expect.stringContaining('Search across archive items'),
    }))
  }, 20000)

  test('maps list_galleries tool results into content and structured payloads', async () => {
    const client = startStorytellingServer()

    await client.initialize()

    const result = await client.callTool('list_galleries', {})

    expect(result.content?.[0]?.type).toBe('text')
    expect(result.content?.[0]?.text).toContain('Available galleries:')
    expect(result.structuredContent).toEqual(expect.objectContaining({
      galleries: expect.arrayContaining(['demo']),
    }))
  }, 20000)

  test('maps list_albums tool results into content and structured payloads', async () => {
    const client = startStorytellingServer()

    await client.initialize()

    const result = await client.callTool('list_albums', { gallery: 'demo' })

    expect(result.content?.[0]?.type).toBe('text')
    expect(result.content?.[0]?.text).toMatch(/Found \d+ album\(s\) in demo\./)
    expect(result.structuredContent).toEqual(expect.objectContaining({
      albums: expect.any(Array),
    }))
    const structuredAlbums = albumListStructuredSchema.parse(result.structuredContent)
    expect(structuredAlbums.albums.length).toBeGreaterThan(0)
  }, 20000)

  test('maps album and index storytelling tools into content and structured payloads', async () => {
    const client = startStorytellingServer()

    await client.initialize()

    const albums = await client.callTool('list_albums', { gallery: 'demo' })
  const structuredAlbums = albumListStructuredSchema.parse(albums.structuredContent)
  const firstAlbum = structuredAlbums.albums[0]
    expect(firstAlbum?.name).toBeTruthy()

    const albumStory = await client.callTool('get_album_story', {
      gallery: 'demo',
      album: firstAlbum.name,
    })
    expect(albumStory.content?.[0]?.type).toBe('text')
    expect(albumStory.content?.[0]?.text).toBeTruthy()
    expect(summaryStructuredSchema.parse(albumStory.structuredContent).summary).toBeTruthy()

    const peopleIndex = await client.callTool('get_people_story_index', {})
    expect(peopleIndex.content?.[0]?.text).toBeTruthy()
    expect(summaryStructuredSchema.parse(peopleIndex.structuredContent).summary).toBeTruthy()

    const onThisDay = await client.callTool('get_on_this_day_story', { monthDay: '01-02' })
    expect(onThisDay.content?.[0]?.text).toBeTruthy()
    expect(summaryStructuredSchema.parse(onThisDay.structuredContent).summary).toBeTruthy()
  }, 20000)

  test('executes a real location query against committed demo data', async () => {
    const client = startStorytellingServer()

    await client.initialize()

    const result = await client.callTool('search_story_moments', {
      gallery: 'demo',
      country: 'Canada',
      limit: 5,
    })

    const structured = searchStructuredSchema.parse(result.structuredContent)

    expect(structured.filtersApplied).toEqual(expect.objectContaining({
      gallery: 'demo',
      country: 'Canada',
      region: null,
    }))
    expect(result.content?.[0]?.text).toMatch(/Found \d+ story candidate/)
    expect(structured.summary).toMatch(/Found \d+ story candidate/)
    expect(structured.matches.length).toBeGreaterThan(0)
    expect(structured.matches.every(match => match.city.includes('Canada'))).toBe(true)
  }, 20000)
})
