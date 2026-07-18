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
  })).optional(),
  structuredContent: z.record(z.string(), z.unknown()).optional(),
})

const getGalleries = vi.hoisted(() => vi.fn())
const getAlbums = vi.hoisted(() => vi.fn())
const buildAlbumStory = vi.hoisted(() => vi.fn())
const buildAlbumResourceText = vi.hoisted(() => vi.fn())
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
  buildAlbumResourceText,
  buildAlbumStory,
  getPeopleStoryIndex,
  getOnThisDayStory,
  buildStorytellingOverview,
}))

vi.mock('../src/models/config', () => ({
  default: { defaultGallery: 'demo', nextPort: 3030 },
}))

vi.mock('../src/types/generated', () => {
  const generatedGalleries = ['demo', 'public'] as const
  return {
    generatedGalleries,
    generatedGallerySchema: z.enum(generatedGalleries),
  }
})

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
  buildAlbumStory.mockReset()
  buildAlbumResourceText.mockReset()
  getPeopleStoryIndex.mockReset()
  getOnThisDayStory.mockReset()
  buildStorytellingOverview.mockReset()

  getGalleries.mockResolvedValue({ galleries: ['demo', 'public'] })
  getAlbums.mockResolvedValue({
    demo: {
      albums: [{ name: 'trip', h1: 'Trip', h2: 'Notes', year: '2024', search: 'Nagoya Castle, Atsuta Shrine' }],
    },
    public: {
      albums: [{ name: 'other-trip', h1: 'Other Trip', h2: '', year: '2025', search: null }],
    },
  })
  buildAlbumStory.mockResolvedValue({
    summary: 'Album summary',
    places: ['Nagoya'],
    people: ['Mister Gingerbread'],
    personCounts: [{ name: 'Mister Gingerbread', count: 23 }],
  })
  buildAlbumResourceText.mockResolvedValue([
    'Album summary',
    'Places: Nagoya',
    'Persons: Mister Gingerbread (23)',
  ].join('\n'))
  getPeopleStoryIndex.mockResolvedValue({
    summary: 'People summary',
    people: [{
      name: 'Mister Gingerbread',
      appearances: 3,
      firstSeen: '2024-01-02',
      lastSeen: '2024-02-03',
      dateOfBirth: null,
      albums: ['trip'],
    }],
  })
  getOnThisDayStory.mockResolvedValue({
    summary: 'On this day summary',
    monthDay: '01-02',
    matches: [{ date: '2024-01-02', caption: 'On this day memory', filename: '2024-01-02-01.jpg' }],
  })
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
    expect(result.instructions).toContain('history://galleries')
    expect(result.instructions).toContain('get_on_this_day_story')
  })

  test('lists storytelling tools for client exploration', async () => {
    const client = await createConnection()

    await client.initialize()
    const result = await client.listTools()

    expect(result.tools.map(tool => tool.name)).toEqual([
      'get_album_story',
      'get_on_this_day_story',
    ])
    expect(result.tools.find(tool => tool.name === 'get_album_story')).toEqual(expect.objectContaining({
      title: 'Get Album Story',
      description: expect.stringContaining('single album'),
    }))
  })

  test('lists resource templates for galleries, albums, people, and days', async () => {
    const client = await createConnection()

    await client.initialize()
    const result = await client.listResourceTemplates()

    expect(result.resourceTemplates.map(template => template.uriTemplate)).toEqual(expect.arrayContaining([
      'history://gallery/{gallery}',
      'history://album/{gallery}/{album}',
      'history://person/{gallery}/{name}',
      'history://day/{gallery}/{monthDay}',
    ]))
  })

  test('lists and reads the consolidated storytelling guide resource', async () => {
    const client = await createConnection()

    await client.initialize()
    const resources = await client.listResources()

    expect(resources.resources).toEqual(expect.arrayContaining([
      expect.objectContaining({ uri: 'history://galleries', title: 'History Photo Galleries' }),
      expect.objectContaining({ uri: 'history://guide', title: 'History Storytelling Guide' }),
      expect.objectContaining({ uri: 'history://gallery/demo', title: 'History Gallery' }),
      expect.objectContaining({ uri: 'history://album/demo/trip', title: 'History Album' }),
      expect.objectContaining({ uri: 'history://person/demo/Mister%20Gingerbread', title: 'History Person' }),
    ]))

    const guide = await client.readResource('history://guide')

    expect(guide.contents[0]).toEqual(expect.objectContaining({
      uri: 'history://guide',
      text: expect.stringContaining('Overview text'),
    }))
    expect(guide.contents[0]?.text).toContain('history://galleries')
    expect(guide.contents[0]?.text).toContain('Recommended workflow:')
  })

  test('reads gallery inventory resources', async () => {
    const client = await createConnection()

    await client.initialize()
    const galleries = await client.readResource('history://galleries')
    const gallery = await client.readResource('history://gallery/demo')
    const otherGallery = await client.readResource('history://gallery/public')

    expect(getGalleries).toHaveBeenCalledTimes(1)
    expect(galleries.contents[0]?.text).toContain('Available galleries')
    expect(galleries.contents[0]?.text).toContain('demo: 1 album(s)')
    expect(gallery.contents[0]?.text).toContain('Gallery is demo')
    expect(gallery.contents[0]?.text).toContain('trip: Trip')
    expect(gallery.contents[0]?.text).toContain('with keywords Nagoya Castle, Atsuta Shrine')
    expect(otherGallery.contents[0]?.text).toContain('Gallery is public')
    expect(otherGallery.contents[0]?.text).toContain('other-trip: Other Trip')
  })

  test('reads album and person resources', async () => {
    const client = await createConnection()

    await client.initialize()
    const album = await client.readResource('history://album/demo/trip')
    const person = await client.readResource('history://person/demo/Mister%20Gingerbread')

    expect(album.contents[0]?.text).toContain('Album summary')
    expect(album.contents[0]?.text).toContain('Places: Nagoya')
    expect(album.contents[0]?.text).toContain('Persons: Mister Gingerbread (23)')
    expect(person.contents[0]?.text).toContain('Person Mister Gingerbread')
    expect(person.contents[0]?.text).toContain('Appearances: 3')
    expect(person.contents[0]?.text).toContain('GUI: http://localhost:3030/demo/persons?person=Mister+Gingerbread')
  })

  test('maps get_album_story responses into text and structured content', async () => {
    const client = await createConnection()

    await client.initialize()
    const output = await client.callTool('get_album_story', { gallery: 'demo', album: 'trip' })

    expect(buildAlbumStory).toHaveBeenCalledWith('demo', 'trip', 8)
    expect(output.content).toEqual([{ type: 'text', text: 'Album summary' }])
    expect(output.structuredContent).toEqual(expect.objectContaining({ summary: 'Album summary' }))
  })

  test('defaults gallery to config.defaultGallery when get_album_story omits it', async () => {
    const client = await createConnection()

    await client.initialize()
    await client.callTool('get_album_story', { album: 'trip' })

    expect(buildAlbumStory).toHaveBeenCalledWith('demo', 'trip', 8)
  })

  test('maps get_people_story_index and get_on_this_day_story responses', async () => {
    const client = await createConnection()

    await client.initialize()

    const onThisDayOutput = await client.callTool('get_on_this_day_story', { monthDay: '01-02' })
    expect(getOnThisDayStory).toHaveBeenCalledWith('demo', '01-02', 8)
    expect(onThisDayOutput.content).toEqual([{ type: 'text', text: 'On this day summary' }])
    expect(onThisDayOutput.structuredContent).toEqual(expect.objectContaining({ summary: 'On this day summary' }))
  })

  test('returns recoverable tool errors instead of raw protocol failures', async () => {
    const client = await createConnection()
    buildAlbumStory.mockRejectedValueOnce(new ReferenceError('No album was found'))

    await client.initialize()

    const output = await client.callTool('get_album_story', { gallery: 'demo', album: 'missing' })

    expect(output.isError).toBe(true)
    expect(output.content).toEqual([{ type: 'text', text: 'Error: No album was found' }])
    expect(output.structuredContent).toBeUndefined()
  })

  test('reads on-this-day resources', async () => {
    const client = await createConnection()

    await client.initialize()
    const output = await client.readResource('history://day/demo/01-02')

    expect(getOnThisDayStory).toHaveBeenCalledWith('demo', '01-02', 8)
    expect(output.contents[0]?.text).toContain('On this day summary')
    expect(output.contents[0]?.text).toContain('GUI: http://localhost:3030/demo/today?day=01-02')
    expect(output.contents[0]?.text).toContain('2024-01-02: On this day memory')
  })

  test('rejects invalid on-this-day resource monthDay values', async () => {
    const client = await createConnection()

    await client.initialize()

    await expect(client.readResource('history://day/demo/2016-07')).rejects.toThrow(
      'Invalid string: must match pattern',
    )
  })
})
