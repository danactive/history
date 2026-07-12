import { InMemoryTransport } from '@modelcontextprotocol/server'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
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
}

type InitializeResult = {
  protocolVersion: string
  serverInfo: { name: string, version: string }
  capabilities?: Record<string, unknown>
}

type ListToolsResult = {
  tools: Array<{
    name: string
    title?: string
    description?: string
    inputSchema?: unknown
  }>
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

const getGalleries = vi.hoisted(() => vi.fn())
const getAlbums = vi.hoisted(() => vi.fn())
const searchStoryMoments = vi.hoisted(() => vi.fn())
const buildAlbumStory = vi.hoisted(() => vi.fn())
const getPeopleStoryIndex = vi.hoisted(() => vi.fn())
const getOnThisDayStory = vi.hoisted(() => vi.fn())
const buildStorytellingOverview = vi.hoisted(() => vi.fn())

vi.mock('../src/lib/galleries', () => ({
  default: getGalleries,
}))

vi.mock('../src/lib/albums', () => ({
  default: getAlbums,
}))

vi.mock('../src/lib/storytelling', () => ({
  searchStoryMoments,
  buildAlbumStory,
  getPeopleStoryIndex,
  getOnThisDayStory,
  buildStorytellingOverview,
}))

vi.mock('../src/models/config', () => ({
  default: { defaultGallery: 'demo' },
}))

class McpInMemoryClient {
  private nextId = 1
  private readonly pending = new Map<number, {
    resolve: (value: JsonRpcSuccess) => void
    reject: (reason?: unknown) => void
  }>()

  constructor(private readonly transport: InMemoryTransport) {
    transport.onmessage = (message) => {
      const parsedMessage = jsonRpcSuccessSchema.safeParse(message)
      if (!parsedMessage.success) {
        return
      }

      if (typeof parsedMessage.data.id === 'number') {
        const resolver = this.pending.get(parsedMessage.data.id)
        if (resolver) {
          this.pending.delete(parsedMessage.data.id)
          resolver.resolve(parsedMessage.data)
        }
      }
    }
  }

  async start() {
    await this.transport.start()
  }

  async close() {
    await this.transport.close()
  }

  async initialize() {
    const response = await this.request('initialize', {
      protocolVersion: '2025-11-05',
      capabilities: {},
      clientInfo: {
        name: 'vitest-in-memory-client',
        version: '1.0.0',
      },
    })

    expect(response.result).toBeDefined()
    await this.notify('notifications/initialized', {})
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
    const result = new Promise<JsonRpcSuccess>((resolve, reject) => {
      this.pending.set(id, { resolve, reject })
    })

    await this.transport.send({
      jsonrpc: '2.0',
      id,
      method,
      params,
    })

    return result
  }

  private async notify(method: string, params: Record<string, unknown>) {
    await this.transport.send({
      jsonrpc: '2.0',
      method,
      params,
    })
  }
}

const connections: Array<{ client: McpInMemoryClient, serverTransport: InMemoryTransport }> = []

async function createConnection() {
  vi.resetModules()
  const [{ createStorytellingServer }, { InMemoryTransport: LocalInMemoryTransport }] = await Promise.all([
    import('./storytelling'),
    import('@modelcontextprotocol/server'),
  ])

  const [clientTransport, serverTransport] = LocalInMemoryTransport.createLinkedPair()
  const client = new McpInMemoryClient(clientTransport)
  const server = createStorytellingServer()

  await server.connect(serverTransport)
  await client.start()

  connections.push({ client, serverTransport })
  return client
}

afterEach(async () => {
  while (connections.length > 0) {
    const connection = connections.pop()
    if (!connection) continue
    await connection.client.close()
    await connection.serverTransport.close()
  }
})

beforeEach(() => {
  getGalleries.mockReset()
  getAlbums.mockReset()
  searchStoryMoments.mockReset()
  buildAlbumStory.mockReset()
  getPeopleStoryIndex.mockReset()
  getOnThisDayStory.mockReset()
  buildStorytellingOverview.mockReset()

  getGalleries.mockResolvedValue({ galleries: ['demo', 'fake'] })
  getAlbums.mockResolvedValue({
    demo: {
      albums: [{ name: 'trip', h1: 'Trip', h2: 'Notes', year: '2024' }],
    },
  })
  searchStoryMoments.mockResolvedValue({
    summary: 'Found 1 story candidate from 3 scanned items.',
    filtersApplied: {
      query: null,
      gallery: 'demo',
      album: null,
      person: null,
      city: null,
      country: 'Japan',
      region: 'Aichi',
      year: null,
      limit: 8,
    },
    totalCandidates: 3,
    matches: [{ caption: 'Nagoya Castle', filename: '2024-05-01-01.jpg' }],
  })
  buildAlbumStory.mockResolvedValue({ summary: 'Album summary' })
  getPeopleStoryIndex.mockResolvedValue({ summary: 'People summary' })
  getOnThisDayStory.mockResolvedValue({ summary: 'On this day summary' })
  buildStorytellingOverview.mockResolvedValue('Overview text')
})

describe('storytelling MCP server', () => {
  test('completes in-memory handshake and advertises capabilities', async () => {
    const client = await createConnection()

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
  })

  test('lists storytelling tools for client exploration', async () => {
    const client = await createConnection()

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
  })

  test('maps list_galleries results into text and structured content', async () => {
    const client = await createConnection()

    await client.initialize()
    const output = await client.callTool('list_galleries', {})

    expect(getGalleries).toHaveBeenCalledTimes(1)
    expect(output).toEqual({
      content: [{ type: 'text', text: 'Available galleries: demo, fake' }],
      structuredContent: { galleries: ['demo', 'fake'] },
    })
  })

  test('maps list_albums results into text and structured content', async () => {
    const client = await createConnection()

    await client.initialize()
    const output = await client.callTool('list_albums', { gallery: 'demo' })

    expect(getAlbums).toHaveBeenCalledWith('demo')
    expect(output).toEqual({
      content: [{ type: 'text', text: 'Found 1 album(s) in demo.' }],
      structuredContent: {
        albums: [{ name: 'trip', h1: 'Trip', h2: 'Notes', year: '2024' }],
      },
    })
  })

  test('accepts country and region location queries in search_story_moments and forwards them', async () => {
    const client = await createConnection()

    await client.initialize()
    const output = await client.callTool('search_story_moments', {
      gallery: 'demo',
      country: 'Japan',
      region: 'Aichi',
    })

    expect(searchStoryMoments).toHaveBeenCalledWith({
      gallery: 'demo',
      country: 'Japan',
      region: 'Aichi',
      limit: 8,
    })
    expect(output).toEqual({
      content: [{ type: 'text', text: 'Found 1 story candidate from 3 scanned items.\nTop match: Nagoya Castle (2024-05-01-01.jpg)' }],
      structuredContent: expect.objectContaining({
        filtersApplied: expect.objectContaining({ country: 'Japan', region: 'Aichi' }),
      }),
    })
  })

  test('accepts region-only location queries in search_story_moments', async () => {
    const client = await createConnection()

    await client.initialize()
    await client.callTool('search_story_moments', { region: 'Aichi' })

    expect(searchStoryMoments).toHaveBeenCalledWith({ region: 'Aichi', limit: 8 })
  })

  test('maps get_album_story responses into text and structured content', async () => {
    const client = await createConnection()

    await client.initialize()
    const output = await client.callTool('get_album_story', { gallery: 'demo', album: 'trip' })

    expect(buildAlbumStory).toHaveBeenCalledWith('demo', 'trip', 8)
    expect(output).toEqual({
      content: [{ type: 'text', text: 'Album summary' }],
      structuredContent: { summary: 'Album summary' },
    })
  })

  test('maps get_people_story_index and get_on_this_day_story responses', async () => {
    const client = await createConnection()

    await client.initialize()

    const peopleOutput = await client.callTool('get_people_story_index', {})
    expect(getPeopleStoryIndex).toHaveBeenCalledWith('demo')
    expect(peopleOutput).toEqual({
      content: [{ type: 'text', text: 'People summary' }],
      structuredContent: { summary: 'People summary' },
    })

    const onThisDayOutput = await client.callTool('get_on_this_day_story', { monthDay: '01-02' })
    expect(getOnThisDayStory).toHaveBeenCalledWith('demo', '01-02', 8)
    expect(onThisDayOutput).toEqual({
      content: [{ type: 'text', text: 'On this day summary' }],
      structuredContent: { summary: 'On this day summary' },
    })
  })
})
