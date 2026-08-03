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
  instructions: z.string().optional(),
})

const listToolsResultSchema = z.object({
  tools: z.array(z.object({
    name: z.string(),
    title: z.string().optional(),
    description: z.string().optional(),
    inputSchema: z.unknown().optional(),
  })),
})

const listResourcesResultSchema = z.object({
  resources: z.array(z.object({
    uri: z.string(),
    name: z.string().optional(),
    title: z.string().optional(),
    description: z.string().optional(),
    mimeType: z.string().optional(),
  })),
})

const listResourceTemplatesResultSchema = z.object({
  resourceTemplates: z.array(z.object({
    uriTemplate: z.string(),
    name: z.string().optional(),
    title: z.string().optional(),
    description: z.string().optional(),
    mimeType: z.string().optional(),
  })),
})

const readResourceResultSchema = z.object({
  contents: z.array(z.object({
    uri: z.string(),
    text: z.string().optional(),
    mimeType: z.string().optional(),
  })),
})

const toolCallResultSchema = z.object({
  isError: z.boolean().optional(),
  content: z.array(z.object({
    type: z.string(),
    text: z.string().optional(),
    uri: z.string().optional(),
    name: z.string().optional(),
    title: z.string().optional(),
    description: z.string().optional(),
    mimeType: z.string().optional(),
  })).optional(),
  structuredContent: z.record(z.string(), z.unknown()).optional(),
})

const getPromptResultSchema = z.object({
  messages: z.array(z.object({
    role: z.string(),
    content: z.object({
      type: z.string(),
      text: z.string().optional(),
      uri: z.string().optional(),
      name: z.string().optional(),
      title: z.string().optional(),
      description: z.string().optional(),
    }),
  })),
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

  async listResources() {
    const response = await this.request('resources/list', {})

    if (response.error) {
      throw new Error(`Resource listing failed: ${response.error.message}`)
    }

    return listResourcesResultSchema.parse(response.result)
  }

  async listResourceTemplates() {
    const response = await this.request('resources/templates/list', {})

    if (response.error) {
      throw new Error(`Resource template listing failed: ${response.error.message}`)
    }

    return listResourceTemplatesResultSchema.parse(response.result)
  }

  async readResource(uri: string) {
    const response = await this.request('resources/read', { uri })

    if (response.error) {
      throw new Error(`Resource read failed: ${response.error.message}`)
    }

    return readResourceResultSchema.parse(response.result)
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

  async getPrompt(name: string, args: Record<string, unknown>) {
    const response = await this.request('prompts/get', {
      name,
      arguments: args,
    })

    if (response.error) {
      throw new Error(`Prompt retrieval failed: ${response.error.message}`)
    }

    return getPromptResultSchema.parse(response.result)
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
    expect(result.instructions).toContain('history://galleries')
  }, 20000)

  test('lists storytelling tools for client exploration', async () => {
    const client = startStorytellingServer()

    await client.initialize()
    const result = await client.listTools()

    expect(result.tools.map(tool => tool.name)).toEqual([
      'get_album_story',
      'get_on_this_day_story',
      'get_person_story',
    ])
    expect(result.tools.find(tool => tool.name === 'get_album_story')).toEqual(expect.objectContaining({
      title: 'Get Album Story',
      description: expect.stringContaining('configured gallery keywords'),
    }))
    expect(result.tools.find(tool => tool.name === 'get_on_this_day_story')).toEqual(expect.objectContaining({
      title: 'Get memories On This Day Story',
      description: expect.stringContaining('configured gallery keywords'),
    }))
    expect(result.tools.find(tool => tool.name === 'get_person_story')).toEqual(expect.objectContaining({
      title: 'Get Person Story',
      description: expect.stringContaining('gallery keyword inventory'),
    }))
  }, 20000)

  test('lists gallery and people inventory resource templates', async () => {
    const client = startStorytellingServer()

    await client.initialize()
    const result = await client.listResourceTemplates()

    expect(result.resourceTemplates.map(template => template.uriTemplate)).toEqual(expect.arrayContaining([
      'history://gallery/{gallery}',
      'history://people/{gallery}',
    ]))
    expect(result.resourceTemplates).toHaveLength(2)
  }, 20000)

  test('lists only inventory resources', async () => {
    const client = startStorytellingServer()

    await client.initialize()
    const resources = await client.listResources()

    expect(resources.resources).toEqual(expect.arrayContaining([
      expect.objectContaining({ uri: 'history://galleries', title: 'History Photo Galleries' }),
      expect.objectContaining({ uri: 'history://gallery/demo', title: 'History Gallery' }),
      expect.objectContaining({ uri: 'history://people/demo', title: 'History People' }),
    ]))
    expect(resources.resources.map(resource => resource.uri)).not.toEqual(expect.arrayContaining([
      'history://guide',
      'history://album/demo/sample',
      'history://person/demo/Mister%20Gingerbread',
      'history://day/demo/01-02',
    ]))
  }, 20000)

  test('reads gallery and people inventory resources', async () => {
    const client = startStorytellingServer()

    await client.initialize()

    const galleries = await client.readResource('history://galleries')
    const gallery = await client.readResource('history://gallery/demo')
    const people = await client.readResource('history://people/demo')

    expect(galleries.contents[0]?.text).toContain('Available galleries')
    expect(galleries.contents[0]?.text).toContain('Default gallery: dan')
    expect(galleries.contents[0]?.text).toContain('Non-default galleries: demo')
    expect(galleries.contents[0]?.text).toContain('- demo:')
    expect(gallery.contents[0]?.text).toContain('# Gallery: demo')
    expect(gallery.contents[0]?.text).toContain('## Albums')
    expect(people.contents[0]?.text).toContain('Person inventory for gallery demo')
  }, 20000)

  test('returns album, on-this-day, and person details through tools', async () => {
    const client = startStorytellingServer()

    await client.initialize()

    const albumStory = await client.callTool('get_album_story', {
      gallery: 'demo',
      album: 'sample',
    })
    expect(albumStory.content?.[0]?.text).toContain('Album')
    expect(albumStory.content?.[0]?.text).toContain('Highlights')
    expect(albumStory.content?.[0]?.text).toContain('## Gallery keywords\n- Album: sample')
    expect(albumStory.content?.[0]?.text).toContain('View the graphical interface in a web browser: http://localhost:3030/demo/sample')
    expect(albumStory.structuredContent).toEqual({
      gallery: 'demo',
      album: 'sample',
    })

    const onThisDay = await client.callTool('get_on_this_day_story', { gallery: 'demo', monthDay: '01-02' })
    expect(onThisDay.content?.[0]?.text).toContain('Matching memories')
    expect(onThisDay.content?.[0]?.text).toContain('## Gallery keywords\n- Album: sample')
    expect(onThisDay.structuredContent).toEqual({
      gallery: 'demo',
      monthDay: '01-02',
    })

    const person = await client.callTool('get_person_story', { gallery: 'demo', person: 'Mister Gingerbread' })
    expect(person.content?.[0]?.text).toContain('# Person story: Mister Gingerbread')
    expect(person.content?.[0]?.text).toContain('## Related albums\n- Album: sample')
    expect(person.content?.[0]?.text).toContain('- Popular keywords: ')
    expect(person.content?.[0]?.text).not.toContain('## Gallery keywords')
    expect(person.structuredContent).toEqual({
      gallery: 'demo',
      person: 'Mister Gingerbread',
    })
  }, 20000)

  test('links a gallery resource to discover album names', async () => {
    const client = startStorytellingServer()

    await client.initialize()
    const output = await client.callTool('get_album_story', { gallery: 'demo' })

    expect(output.content).toEqual(expect.arrayContaining([
      expect.objectContaining({
        type: 'resource_link',
        uri: 'history://gallery/demo',
        name: 'Album inventory for demo',
      }),
    ]))
    expect(output.structuredContent).toEqual({
      gallery: 'demo',
      resourceUri: 'history://gallery/demo',
    })
  }, 20000)

  test('links a people resource to discover person names', async () => {
    const client = startStorytellingServer()

    await client.initialize()
    const output = await client.callTool('get_person_story', { gallery: 'demo' })

    expect(output.content).toEqual(expect.arrayContaining([
      expect.objectContaining({
        type: 'resource_link',
        uri: 'history://people/demo',
        name: 'People in demo',
      }),
    ]))
    expect(output.structuredContent).toEqual({
      gallery: 'demo',
      resourceUri: 'history://people/demo',
    })
  }, 20000)

  test('links the gallery inventory when a prompt query is omitted', async () => {
    const client = startStorytellingServer()

    await client.initialize()
    const prompt = await client.getPrompt('story-from-history', {})

    expect(prompt.messages).toEqual([
      {
        role: 'user',
        content: {
          type: 'resource_link',
          uri: 'history://galleries',
          name: 'Photo gallery inventory',
          title: 'History Photo Galleries',
          description: 'Available galleries and their album counts.',
        },
      },
      {
        role: 'user',
        content: {
          type: 'text',
          text: 'Read the linked inventory to discover galleries or album names, then call this prompt again with a story request.',
        },
      },
    ])
  }, 20000)

  test('returns tool errors as recoverable MCP results', async () => {
    const client = startStorytellingServer()

    await client.initialize()

    const output = await client.callTool('get_album_story', {
      gallery: 'demo',
      album: 'missing-album',
    })

    expect(output.isError).toBe(true)
    expect(output.content?.[0]?.text).toContain('Error:')
    expect(output.structuredContent).toBeUndefined()
  }, 20000)

})
