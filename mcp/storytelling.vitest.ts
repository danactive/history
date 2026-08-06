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

const listPromptsResultSchema = z.object({
  prompts: z.array(z.object({
    name: z.string(),
    title: z.string().optional(),
    description: z.string().optional(),
    arguments: z.array(z.object({
      name: z.string(),
      description: z.string().optional(),
      required: z.boolean().optional(),
    })).optional(),
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
    _meta: z.record(z.string(), z.unknown()).optional(),
  })),
})

const toolCallResultSchema = z.object({
  isError: z.boolean().optional(),
  content: z.array(z.object({
    type: z.string(),
    text: z.string().optional(),
    data: z.string().optional(),
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
      mimeType: z.string().optional(),
    }),
  })),
})

const getGalleries = vi.hoisted(() => vi.fn())
const getAlbums = vi.hoisted(() => vi.fn())
const getAlbum = vi.hoisted(() => vi.fn())
const buildAlbumDetailsText = vi.hoisted(() => vi.fn())
const buildGalleriesDetailsText = vi.hoisted(() => vi.fn())
const buildGalleryDetailsText = vi.hoisted(() => vi.fn())
const buildGalleryInventoryText = vi.hoisted(() => vi.fn())
const buildPeopleInventoryText = vi.hoisted(() => vi.fn())
const buildDateDetailsText = vi.hoisted(() => vi.fn())
const buildPersonDetailsText = vi.hoisted(() => vi.fn())
const getStorytellingDefaultGallery = vi.hoisted(() => vi.fn())
const searchStoryMoments = vi.hoisted(() => vi.fn())

vi.mock('../src/lib/galleries', () => ({
  default: getGalleries,
}))

vi.mock('../src/lib/album', () => ({
  default: getAlbum,
}))

vi.mock('../src/lib/albums', () => ({
  default: getAlbums,
}))

vi.mock('../src/lib/storytelling', () => ({
  buildAlbumDetailsText,
  buildDateDetailsText,
  buildGalleriesDetailsText,
  buildGalleryDetailsText,
  buildGalleryInventoryText,
  buildPeopleInventoryText,
  buildPersonDetailsText,
  getStorytellingDefaultGallery,
  searchStoryMoments,
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

  async listPrompts() {
    const response = await this.request('prompts/list', {})
    if (response.error) {
      throw new Error(`Prompt listing failed: ${response.error.message}`)
    }
    return listPromptsResultSchema.parse(response.result)
  }

  async getPrompt(name: string, args: Record<string, unknown>) {
    const response = await this.request('prompts/get', {
      name,
      arguments: args,
    })

    if (response.error) {
      throw new Error(`Prompt get failed: ${response.error.message}`)
    }

    return getPromptResultSchema.parse(response.result)
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
  buildAlbumDetailsText.mockReset()
  buildGalleriesDetailsText.mockReset()
  buildGalleryDetailsText.mockReset()
  buildPeopleInventoryText.mockReset()
  buildPersonDetailsText.mockReset()
  getStorytellingDefaultGallery.mockReset()
  buildDateDetailsText.mockReset()
  searchStoryMoments.mockReset()

  getGalleries.mockResolvedValue({ galleries: ['demo', 'public'] })
  getStorytellingDefaultGallery.mockImplementation((galleries: readonly string[]) => (
    galleries.find(gallery => gallery !== 'demo') ?? 'demo'
  ))
  getAlbums.mockResolvedValue({
    demo: {
      albums: [{ name: 'trip', h1: 'Trip', h2: 'Notes', year: '2024', search: 'Nagoya Castle, Atsuta Shrine' }],
    },
    public: {
      albums: [{ name: 'other-trip', h1: 'Other Trip', h2: '', year: '2025', search: null }],
    },
  })
  getAlbum.mockResolvedValue({
    album: {
      items: [
        {
          id: '1',
          filename: '2024-01-02-01.jpg',
          photoDate: '2024-01-02',
          city: 'Nagoya',
          location: 'Castle',
          caption: 'Castle view',
          description: 'A clear winter afternoon',
          search: null,
          persons: [{ full: 'Mister Gingerbread', dob: null }],
          title: 'Nagoya Castle',
          coordinates: null,
          coordinateAccuracy: null,
          thumbPath: '/galleries/demo/media/thumbs/2024/2024-01-02-01.jpg',
          photoPath: '/galleries/demo/media/photos/2024/2024-01-02-01.jpg',
          mediaPath: '/galleries/demo/media/photos/2024/2024-01-02-01.jpg',
          videoPaths: null,
          reference: null,
        },
        {
          id: '2',
          filename: '2024-01-03-02.mp4',
          photoDate: '2024-01-03',
          city: 'Nagoya',
          location: 'Shrine',
          caption: 'Shrine video',
          description: null,
          search: null,
          persons: null,
          title: 'Atsuta Shrine',
          coordinates: null,
          coordinateAccuracy: null,
          thumbPath: '/galleries/demo/media/thumbs/2024/2024-01-03-02.jpg',
          photoPath: '/galleries/demo/media/photos/2024/2024-01-03-02.jpg',
          mediaPath: '/galleries/demo/media/videos/2024/2024-01-03-02.mp4',
          videoPaths: ['/galleries/demo/media/videos/2024/2024-01-03-02.mp4'],
          reference: null,
        },
      ],
      meta: { gallery: 'demo' },
    },
  })
  buildGalleriesDetailsText.mockResolvedValue([
    'Available galleries',
    'Default gallery: public',
    'Non-default galleries: demo',
    'Gallery album counts:',
    '- demo: 1 album(s)',
    '- public (default): 1 album(s)',
  ].join('\n'))
  buildGalleryInventoryText.mockImplementation(async (gallery: string, options?: { page?: number, limit?: number }) => {
    const page = options?.page ?? 1
    const limit = options?.limit ?? 25

    if (gallery === 'public') {
      return [
        '# Gallery: public',
        '',
        '## Overview',
        `- Page: ${page} of 1`,
        '- Showing albums 1-1',
        '',
        '## Albums',
        '- other-trip | title=Other Trip | year=unknown | keywords=none',
        '',
        '## Pagination',
        `- Read a specific page: history://gallery/public?page=N&limit=${limit}`,
      ].join('\n')
    }

    return [
      '# Gallery: demo',
      '',
      '## Overview',
      `- Page: ${page} of 1`,
      '- Showing albums 1-1',
      '',
      '## Albums',
      '- trip | title=Trip | year=unknown | keywords=Nagoya Castle, Atsuta Shrine',
      '',
      '## Pagination',
      `- Read a specific page: history://gallery/demo?page=N&limit=${limit}`,
    ].join('\n')
  })
  buildPeopleInventoryText.mockImplementation(async (gallery: string) => [
    `Person inventory for gallery ${gallery}`,
    'People: 1',
    '- Mister Gingerbread (3 appearances)',
  ].join('\n'))
  buildAlbumDetailsText.mockResolvedValue([
    'Album summary',
    'Places: Nagoya',
    'Persons: Mister Gingerbread (23)',
    'Gallery keywords:',
    '- trip: Nagoya Castle, Atsuta Shrine',
    'View the graphical interface in a web browser: http://localhost:3030/demo/trip',
  ].join('\n'))
  buildPersonDetailsText.mockResolvedValue([
    'Person Mister Gingerbread',
    'Gallery is demo',
    'Appearances: 3',
    'First seen: 2024-01-02',
    'Last seen: 2024-02-03',
    'Date of birth: unknown',
    'Albums:',
    '- trip',
    '  Keywords: Nagoya Castle, Atsuta Shrine',
    '  Popular keywords: Nagoya Castle (2), Atsuta Shrine (1)',
    'Gallery keywords:',
    '- trip: Nagoya Castle, Atsuta Shrine',
    'View the graphical interface in a web browser: http://localhost:3030/demo/persons?query=person%3AMister+Gingerbread',
  ].join('\n'))
  buildDateDetailsText.mockResolvedValue([
    'On this day summary',
    'Gallery keywords:',
    '- trip: Nagoya Castle, Atsuta Shrine',
    'Matching memories (newest first):',
    '- 2024-01-02: On this day memory',
    '  Album: trip',
    'View the graphical interface in a web browser: http://localhost:3030/demo/today?day=01-02',
  ].join('\n'))
  searchStoryMoments.mockResolvedValue({
    summary: 'Found 1 story candidate from 2 scanned items.',
    filtersApplied: {
      query: 'castle',
      gallery: 'public',
      album: null,
      person: null,
      city: null,
      country: null,
      region: null,
      year: null,
      limit: 8,
    },
    totalCandidates: 2,
    matches: [{
      gallery: 'demo',
      album: 'trip',
      filename: '2024-01-02-01.jpg',
      date: '2024-01-02',
      title: 'Nagoya Castle',
      caption: 'Castle view',
      description: 'A clear winter afternoon',
      search: null,
      city: 'Nagoya',
      location: 'Castle',
      persons: ['Mister Gingerbread'],
      mediaPath: '/galleries/demo/media/photos/2024/2024-01-02-01.jpg',
      thumbPath: '/galleries/demo/media/thumbs/2024/2024-01-02-01.jpg',
      reference: null,
      visitedPlace: null,
      score: 1,
      reasons: ['matches query'],
    }],
  })
})

describe('storytelling MCP server', () => {
  test('completes in-memory handshake and advertises capabilities', async () => {
    const client = await createConnection()

    const result = await client.initialize()

    expect(result.serverInfo).toEqual({
      name: 'history',
      version: '12.5.0',
    })
    expect(result.protocolVersion).toBeTruthy()
    expect(result.capabilities).toEqual(expect.objectContaining({
      tools: expect.any(Object),
      prompts: expect.any(Object),
      resources: expect.any(Object),
    }))
    expect(result.instructions).toContain('history://galleries')
    expect(result.instructions).toContain('search_story_moments')
    expect(result.instructions).toContain('get_album_media')
    expect(result.instructions).toContain('get_on_this_day_story')
  })

  test('lists storytelling tools for client exploration', async () => {
    const client = await createConnection()

    await client.initialize()
    const result = await client.listTools()

    expect(result.tools.map(tool => tool.name)).toEqual([
      'search_story_moments',
      'get_album_story',
      'get_album_media',
      'get_on_this_day_story',
      'get_person_story',
    ])
    expect(result.tools.find(tool => tool.name === 'search_story_moments')).toEqual(expect.objectContaining({
      title: 'Search Story Moments',
      description: expect.stringContaining('free-text'),
    }))
    expect(result.tools.find(tool => tool.name === 'get_album_story')).toEqual(expect.objectContaining({
      title: 'Get Album Story',
      description: expect.stringContaining('configured gallery keywords'),
    }))
    expect(result.tools.find(tool => tool.name === 'get_on_this_day_story')).toEqual(expect.objectContaining({
      title: 'Get memories On This Day Story',
      description: expect.stringContaining('configured gallery keywords'),
    }))
    expect(result.tools.find(tool => tool.name === 'get_album_media')).toEqual(expect.objectContaining({
      title: 'Get Album Media',
      description: expect.stringContaining('selected photo or video'),
    }))
    expect(result.tools.find(tool => tool.name === 'get_person_story')).toEqual(expect.objectContaining({
      title: 'Get Person Story',
      description: expect.stringContaining('gallery keyword inventory'),
    }))
  })

  test('lists the evidence-based storytelling prompt for client workflows', async () => {
    const client = await createConnection()

    await client.initialize()
    const result = await client.listPrompts()

    expect(result.prompts).toEqual(expect.arrayContaining([
      expect.objectContaining({
        name: 'story-from-history',
        title: 'Story From History',
        description: expect.stringContaining('grounded narrative'),
      }),
    ]))
  })

  test('lists gallery and people inventory resource templates', async () => {
    const client = await createConnection()

    await client.initialize()
    const result = await client.listResourceTemplates()

    expect(result.resourceTemplates).toEqual(expect.arrayContaining([
      expect.objectContaining({ uriTemplate: 'history://gallery/{gallery}' }),
      expect.objectContaining({ uriTemplate: 'history://people/{gallery}' }),
    ]))
    expect(result.resourceTemplates).toHaveLength(2)
  })

  test('lists only inventory resources', async () => {
    const client = await createConnection()

    await client.initialize()
    const resources = await client.listResources()

    expect(resources.resources).toEqual(expect.arrayContaining([
      expect.objectContaining({ uri: 'history://galleries', title: 'History Photo Galleries' }),
      expect.objectContaining({ uri: 'history://gallery/demo', title: 'History Gallery' }),
      expect.objectContaining({ uri: 'history://people/demo', title: 'History People' }),
      expect.objectContaining({ uri: 'ui://history/media-viewer.html', title: 'History Media Viewer' }),
    ]))
    expect(resources.resources.map(resource => resource.uri)).not.toEqual(expect.arrayContaining([
      'history://guide',
      'history://album/demo/trip',
      'history://person/demo/Mister%20Gingerbread',
      'history://day/demo/01-02',
    ]))
  })

  test('returns evidence-first prompt instructions', async () => {
    const client = await createConnection()
    const requestText = [
      'Generate a warm story for this archive request:',
      'Tell me about recurring winter travel.',
    ].join(' ')
    const resourceText = [
      'Read history://galleries and a relevant history://gallery/{gallery} inventory',
      'before composing the response.',
    ].join(' ')
    const searchToolText = 'Call search_story_moments first when you do not already know the exact album or filename.'
    const toolText = [
      'Call get_album_story, get_album_media, get_on_this_day_story, or get_person_story',
      'when relevant to the request.',
    ].join(' ')

    await client.initialize()
    const prompt = await client.getPrompt('story-from-history', {
      query: 'Tell me about recurring winter travel',
      gallery: 'demo',
      tone: 'warm',
    })

    const inventoryMessage = prompt.messages.find(message => message.content.type === 'resource_link')
    const textMessage = prompt.messages.find(message => message.content.type === 'text')

    expect(prompt.messages).toHaveLength(2)
    expect(inventoryMessage?.content).toEqual({
      type: 'resource_link',
      uri: 'history://gallery/demo',
      name: 'Album inventory for demo',
      title: 'History Gallery',
      description: 'Album names for the demo gallery.',
    })
    expect(textMessage?.content.text).toContain(requestText)
    expect(textMessage?.content.text).toContain('Focus on gallery: demo.')
    expect(textMessage?.content.text).toContain(resourceText)
    expect(textMessage?.content.text).toContain(searchToolText)
    expect(textMessage?.content.text).toContain(toolText)
    expect(textMessage?.content.text).toContain('Use only archive evidence returned by the resources and tools.')
    expect(textMessage?.content.text).toContain('say so instead of inventing details')
  })

  test('returns the gallery inventory link when a prompt query is omitted', async () => {
    const client = await createConnection()

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
  })

  test('reads gallery inventory resources', async () => {
    const client = await createConnection()

    await client.initialize()
    const galleries = await client.readResource('history://galleries')
    const gallery = await client.readResource('history://gallery/demo')
    const otherGallery = await client.readResource('history://gallery/public')
    const people = await client.readResource('history://people/demo')
    const mediaViewer = await client.readResource('ui://history/media-viewer.html')

    expect(buildGalleriesDetailsText).toHaveBeenCalledTimes(1)
    expect(buildGalleryInventoryText).toHaveBeenCalledWith('demo', { page: 1, limit: 25 })
    expect(buildGalleryInventoryText).toHaveBeenCalledWith('public', { page: 1, limit: 25 })
    expect(buildPeopleInventoryText).toHaveBeenCalledWith('demo')
    expect(galleries.contents[0]?.text).toContain('Available galleries')
    expect(galleries.contents[0]?.text).toContain('Default gallery: public')
    expect(galleries.contents[0]?.text).toContain('Non-default galleries: demo')
    expect(galleries.contents[0]?.text).toContain('- public (default): 1 album(s)')
    expect(gallery.contents[0]?.text).toContain('# Gallery: demo')
    expect(gallery.contents[0]?.text).toContain('- trip | title=Trip | year=unknown | keywords=Nagoya Castle, Atsuta Shrine')
    expect(otherGallery.contents[0]?.text).toContain('# Gallery: public')
    expect(otherGallery.contents[0]?.text).toContain('- other-trip | title=Other Trip | year=unknown | keywords=none')
    expect(people.contents[0]?.text).toContain('Person inventory for gallery demo')
    expect(people.contents[0]?.text).toContain('Mister Gingerbread (3 appearances)')
    expect(mediaViewer.contents[0]?.mimeType).toBe('text/html;profile=mcp-app')
    expect(mediaViewer.contents[0]?.text).toContain('History media viewer')
  })

  test('reads paginated gallery inventory resources', async () => {
    const client = await createConnection()

    await client.initialize()
    const gallery = await client.readResource('history://gallery/demo?page=2&limit=10')

    expect(buildGalleryInventoryText).toHaveBeenCalledWith('demo', { page: 2, limit: 10 })
    expect(gallery.contents[0]?.text).toContain('- Page: 2 of 1')
    expect(gallery.contents[0]?.text).toContain('history://gallery/demo?page=N&limit=10')
  })

  test('returns album details through a tool', async () => {
    const client = await createConnection()

    await client.initialize()
    const output = await client.callTool('get_album_story', { gallery: 'demo', album: 'trip' })

    expect(buildAlbumDetailsText).toHaveBeenCalledWith('demo', 'trip', 8)
    expect(output.content).toEqual([{ type: 'text', text: [
      'Album summary',
      'Places: Nagoya',
      'Persons: Mister Gingerbread (23)',
      'Gallery keywords:',
      '- trip: Nagoya Castle, Atsuta Shrine',
      'View the graphical interface in a web browser: http://localhost:3030/demo/trip',
    ].join('\n') }])
    expect(output.structuredContent).toEqual({
      gallery: 'demo',
      album: 'trip',
      requestedAlbum: 'trip',
    })
  })

  test('returns story search matches through a tool', async () => {
    const client = await createConnection()

    await client.initialize()
    const output = await client.callTool('search_story_moments', { query: 'castle' })

    expect(searchStoryMoments).toHaveBeenCalledWith({ query: 'castle', gallery: 'public', limit: 8 })
    expect(output.content?.[0]?.text).toContain('Found 1 story candidate from 2 scanned items.')
    expect(output.content?.[0]?.text).toContain('- Album: trip | File: 2024-01-02-01.jpg | Date: 2024-01-02')
    expect(output.content?.[0]?.text).toContain('Use get_album_media with the exact album and file from a match to view the photo or video.')
    expect(output.structuredContent).toEqual(expect.objectContaining({
      gallery: 'public',
      requestedAlbum: null,
      matches: [expect.objectContaining({
        album: 'trip',
        filename: '2024-01-02-01.jpg',
      })],
    }))
  })

  test('resolves human-facing album labels before reading album stories', async () => {
    const client = await createConnection()

    await client.initialize()
    const output = await client.callTool('get_album_story', { gallery: 'demo', album: 'Nagoya Castle' })

    expect(buildAlbumDetailsText).toHaveBeenCalledWith('demo', 'trip', 8)
    expect(output.structuredContent).toEqual({
      gallery: 'demo',
      album: 'trip',
      requestedAlbum: 'Nagoya Castle',
    })
  })

  test('returns album media through a tool with a dedicated viewer URL', async () => {
    const client = await createConnection()

    await client.initialize()
    const output = await client.callTool('get_album_media', { gallery: 'demo', album: 'trip' })

    expect(getAlbum).toHaveBeenCalledWith('demo', 'trip')
    expect(output.content?.[0]).toEqual({ type: 'text', text: [
      'Selected media item 2024-01-02-01.jpg from album trip in gallery demo.',
      'Inline preview uses the largest available display image that stays within the MCP payload budget.',
      'Use the linked album page or interactive app to open the selected item locally.',
      'Interactive media view is available in MCP clients that support Apps.',
      'Archive metadata:',
      'Filename: 2024-01-02-01.jpg',
      'Date: 2024-01-02',
      'Location: Nagoya / Castle',
      'Title: Nagoya Castle',
      'Caption: Castle view',
      'Description: A clear winter afternoon',
      'People: Mister Gingerbread',
    ].join('\n') })
    expect(output.content?.find(block => block.type === 'resource_link')).toEqual(expect.objectContaining({
      uri: 'http://localhost:3030/demo/trip?select=2024-01-02-01.jpg',
      name: 'trip',
      title: 'Nagoya Castle',
      description: 'Castle view',
      mimeType: 'text/html',
    }))
    expect(output.content?.find(block => block.type === 'image')).toBeUndefined()
    expect(output.structuredContent).toEqual({
      gallery: 'demo',
      album: 'trip',
      requestedAlbum: 'trip',
      select: '2024-01-02-01.jpg',
      selectedIndex: 0,
      totalItems: 2,
      item: {
        filename: '2024-01-02-01.jpg',
        title: 'Nagoya Castle',
        caption: 'Castle view',
        description: 'A clear winter afternoon',
        photoDate: '2024-01-02',
        city: 'Nagoya',
        location: 'Castle',
        persons: ['Mister Gingerbread'],
        mediaType: 'image',
        thumbUrl: 'http://localhost:3030/galleries/demo/media/thumbs/2024/2024-01-02-01.jpg',
        photoUrl: 'http://localhost:3030/galleries/demo/media/photos/2024/2024-01-02-01.jpg',
        mediaUrl: 'http://localhost:3030/galleries/demo/media/photos/2024/2024-01-02-01.jpg',
        embeddedPreviewUrl: null,
        videoUrls: [],
      },
      previous: null,
      next: {
        filename: '2024-01-03-02.mp4',
        title: 'Atsuta Shrine',
        caption: 'Shrine video',
        mediaType: 'video',
        thumbUrl: 'http://localhost:3030/galleries/demo/media/thumbs/2024/2024-01-03-02.jpg',
        select: '2024-01-03-02.mp4',
      },
      items: [
        {
          filename: '2024-01-02-01.jpg',
          title: 'Nagoya Castle',
          caption: 'Castle view',
          mediaType: 'image',
          thumbUrl: 'http://localhost:3030/galleries/demo/media/thumbs/2024/2024-01-02-01.jpg',
          select: '2024-01-02-01.jpg',
        },
        {
          filename: '2024-01-03-02.mp4',
          title: 'Atsuta Shrine',
          caption: 'Shrine video',
          mediaType: 'video',
          thumbUrl: 'http://localhost:3030/galleries/demo/media/thumbs/2024/2024-01-03-02.jpg',
          select: '2024-01-03-02.mp4',
        },
      ],
    })
  })

  test('defaults an omitted gallery to the non-config gallery', async () => {
    const client = await createConnection()

    await client.initialize()
    await client.callTool('get_album_story', { album: 'trip' })

    expect(buildAlbumDetailsText).toHaveBeenCalledWith('public', 'trip', 8)
  })

  test('links the gallery resource when an album is omitted for discovery', async () => {
    const client = await createConnection()

    await client.initialize()
    const output = await client.callTool('get_album_story', { gallery: 'public' })

    expect(buildAlbumDetailsText).not.toHaveBeenCalled()
    expect(output.content).toEqual([
      {
        type: 'text',
        text: 'Read the linked History Gallery resource to discover album names in public, then call get_album_story with the selected album.',
      },
      {
        type: 'resource_link',
        uri: 'history://gallery/public',
        name: 'Album inventory for public',
        title: 'History Gallery',
        description: 'Album names and summaries for the public gallery.',
        mimeType: 'text/plain',
      },
    ])
    expect(output.structuredContent).toEqual({
      gallery: 'public',
      resourceUri: 'history://gallery/public',
    })
  })

  test('returns on-this-day details through a tool', async () => {
    const client = await createConnection()

    await client.initialize()

    const onThisDayOutput = await client.callTool('get_on_this_day_story', { monthDay: '01-02' })

    expect(buildDateDetailsText).toHaveBeenCalledWith('public', '01-02', 8)
    expect(onThisDayOutput.content).toEqual([{ type: 'text', text: [
      'On this day summary',
      'Gallery keywords:',
      '- trip: Nagoya Castle, Atsuta Shrine',
      'Matching memories (newest first):',
      '- 2024-01-02: On this day memory',
      '  Album: trip',
      'View the graphical interface in a web browser: http://localhost:3030/demo/today?day=01-02',
    ].join('\n') }])
    expect(onThisDayOutput.structuredContent).toEqual({
      gallery: 'public',
      monthDay: '01-02',
    })
  })

  test('returns person details through a tool', async () => {
    const client = await createConnection()

    await client.initialize()
    const output = await client.callTool('get_person_story', { gallery: 'demo', person: 'Mister Gingerbread' })

    expect(buildPersonDetailsText).toHaveBeenCalledWith('demo', 'Mister Gingerbread')
    expect(output.content?.[0]?.text).toContain('Person Mister Gingerbread')
    expect(output.structuredContent).toEqual({
      gallery: 'demo',
      person: 'Mister Gingerbread',
    })
  })

  test('links the people inventory when a person is omitted for discovery', async () => {
    const client = await createConnection()

    await client.initialize()
    const output = await client.callTool('get_person_story', { gallery: 'public' })

    expect(buildPersonDetailsText).not.toHaveBeenCalled()
    expect(output.content).toEqual([
      {
        type: 'text',
        text: 'Read the linked People inventory to discover person names in public, then call get_person_story with the selected person.',
      },
      {
        type: 'resource_link',
        uri: 'history://people/public',
        name: 'People in public',
        title: 'History People',
        description: 'Person names and appearance counts for the public gallery.',
        mimeType: 'text/plain',
      },
    ])
    expect(output.structuredContent).toEqual({
      gallery: 'public',
      resourceUri: 'history://people/public',
    })
  })

  test('returns recoverable tool errors instead of raw protocol failures', async () => {
    const client = await createConnection()
    buildAlbumDetailsText.mockRejectedValueOnce(new ReferenceError('No album was found'))

    await client.initialize()

    const output = await client.callTool('get_album_story', { gallery: 'demo', album: 'missing' })

    expect(output.isError).toBe(true)
    expect(output.content).toEqual([{ type: 'text', text: 'Error: No album was found' }])
    expect(output.structuredContent).toBeUndefined()
  })

})
