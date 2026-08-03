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
      mimeType: z.string().optional(),
    }),
  })),
})

const getGalleries = vi.hoisted(() => vi.fn())
const getAlbums = vi.hoisted(() => vi.fn())
const buildAlbumDetailsText = vi.hoisted(() => vi.fn())
const buildGalleriesDetailsText = vi.hoisted(() => vi.fn())
const buildGalleryDetailsText = vi.hoisted(() => vi.fn())
const buildPeopleInventoryText = vi.hoisted(() => vi.fn())
const buildDateDetailsText = vi.hoisted(() => vi.fn())
const buildPersonDetailsText = vi.hoisted(() => vi.fn())
const getStorytellingDefaultGallery = vi.hoisted(() => vi.fn())

vi.mock('../src/lib/galleries', () => ({
  default: getGalleries,
}))

vi.mock('../src/lib/albums', () => ({
  default: getAlbums,
}))

vi.mock('../src/lib/storytelling', () => ({
  buildAlbumDetailsText,
  buildDateDetailsText,
  buildGalleriesDetailsText,
  buildGalleryDetailsText,
  buildPeopleInventoryText,
  buildPersonDetailsText,
  getStorytellingDefaultGallery,
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
  buildGalleriesDetailsText.mockResolvedValue([
    'Available galleries',
    'Default gallery: public',
    'Non-default galleries: demo',
    'Gallery album counts:',
    '- demo: 1 album(s)',
    '- public (default): 1 album(s)',
  ].join('\n'))
  buildGalleryDetailsText.mockImplementation(async (gallery: string) => {
    if (gallery === 'public') {
      return [
        'Gallery is public',
        'Albums: 1',
        'other-trip: Other Trip',
      ].join('\n')
    }

    return [
      'Gallery is demo',
      'Albums: 1',
      'trip: Trip',
      'with keywords Nagoya Castle, Atsuta Shrine',
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
    '  Keywords: Nagoya Castle (2), Atsuta Shrine (1)',
    'View the graphical interface in a web browser: http://localhost:3030/demo/persons?query=person%3AMister+Gingerbread',
  ].join('\n'))
  buildDateDetailsText.mockResolvedValue([
    'On this day summary',
    'Matching memories (newest first):',
    '- 2024-01-02: On this day memory',
    '  Album: trip',
    'View the graphical interface in a web browser: http://localhost:3030/demo/today?day=01-02',
  ].join('\n'))
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
      'get_person_story',
    ])
    expect(result.tools.find(tool => tool.name === 'get_album_story')).toEqual(expect.objectContaining({
      title: 'Get Album Story',
      description: expect.stringContaining('narrative context and highlights'),
    }))
    expect(result.tools.find(tool => tool.name === 'get_on_this_day_story')).toEqual(expect.objectContaining({
      title: 'Get memories On This Day Story',
      description: expect.stringContaining('dates, albums, captions'),
    }))
    expect(result.tools.find(tool => tool.name === 'get_person_story')).toEqual(expect.objectContaining({
      title: 'Get Person Story',
      description: expect.stringContaining('appearance counts'),
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
    const toolText = [
      'Call get_album_story, get_on_this_day_story, or get_person_story',
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

    expect(buildGalleriesDetailsText).toHaveBeenCalledTimes(1)
    expect(buildGalleryDetailsText).toHaveBeenCalledWith('demo')
    expect(buildGalleryDetailsText).toHaveBeenCalledWith('public')
    expect(buildPeopleInventoryText).toHaveBeenCalledWith('demo')
    expect(galleries.contents[0]?.text).toContain('Available galleries')
    expect(galleries.contents[0]?.text).toContain('Default gallery: public')
    expect(galleries.contents[0]?.text).toContain('Non-default galleries: demo')
    expect(galleries.contents[0]?.text).toContain('- public (default): 1 album(s)')
    expect(gallery.contents[0]?.text).toContain('Gallery is demo')
    expect(gallery.contents[0]?.text).toContain('trip: Trip')
    expect(gallery.contents[0]?.text).toContain('with keywords Nagoya Castle, Atsuta Shrine')
    expect(otherGallery.contents[0]?.text).toContain('Gallery is public')
    expect(otherGallery.contents[0]?.text).toContain('other-trip: Other Trip')
    expect(people.contents[0]?.text).toContain('Person inventory for gallery demo')
    expect(people.contents[0]?.text).toContain('Mister Gingerbread (3 appearances)')
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
      'View the graphical interface in a web browser: http://localhost:3030/demo/trip',
    ].join('\n') }])
    expect(output.structuredContent).toEqual({
      gallery: 'demo',
      album: 'trip',
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
