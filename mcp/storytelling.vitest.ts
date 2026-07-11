import { beforeEach, describe, expect, test, vi } from 'vitest'

const registry = vi.hoisted(() => ({
  serverConfig: null as { name: string, version: string } | null,
  tools: new Map<string, { config: any, handler: (...args: any[]) => Promise<any> }>(),
  resources: new Map<string, { uri: string, config: any, handler: (...args: any[]) => Promise<any> }>(),
  prompts: new Map<string, { config: any, handler: (...args: any[]) => Promise<any> }>(),
  connect: vi.fn<(transport: unknown) => Promise<void>>(async () => undefined),
  transportInstances: [] as unknown[],
}))

const getGalleries = vi.hoisted(() => vi.fn())
const getAlbums = vi.hoisted(() => vi.fn())
const searchStoryMoments = vi.hoisted(() => vi.fn())
const buildAlbumStory = vi.hoisted(() => vi.fn())
const getPeopleStoryIndex = vi.hoisted(() => vi.fn())
const getOnThisDayStory = vi.hoisted(() => vi.fn())
const buildStorytellingOverview = vi.hoisted(() => vi.fn())

vi.mock('@modelcontextprotocol/server', () => {
  class MockMcpServer {
    constructor(config: { name: string, version: string }) {
      registry.serverConfig = config
    }

    registerTool(name: string, config: any, handler: (...args: any[]) => Promise<any>) {
      registry.tools.set(name, { config, handler })
    }

    registerResource(name: string, uri: string, config: any, handler: (...args: any[]) => Promise<any>) {
      registry.resources.set(name, { uri, config, handler })
    }

    registerPrompt(name: string, config: any, handler: (...args: any[]) => Promise<any>) {
      registry.prompts.set(name, { config, handler })
    }

    connect(transport: unknown) {
      return registry.connect(transport)
    }
  }

  return { McpServer: MockMcpServer }
})

vi.mock('@modelcontextprotocol/server/stdio', () => ({
  StdioServerTransport: class MockStdioServerTransport {
    constructor() {
      registry.transportInstances.push(this)
    }
  },
}))

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

async function loadStorytellingModule() {
  registry.serverConfig = null
  registry.tools.clear()
  registry.resources.clear()
  registry.prompts.clear()
  registry.transportInstances.length = 0
  registry.connect.mockClear()

  vi.resetModules()
  await import('./storytelling')
}

beforeEach(() => {
  getGalleries.mockReset()
  getAlbums.mockReset()
  searchStoryMoments.mockReset()
  buildAlbumStory.mockReset()
  getPeopleStoryIndex.mockReset()
  getOnThisDayStory.mockReset()
  buildStorytellingOverview.mockReset()

  getGalleries.mockResolvedValue({ galleries: ['demo', 'dan'] })
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
  test('registers tools, resources, prompts, and connects a stdio transport', async () => {
    await loadStorytellingModule()

    expect(registry.serverConfig).toEqual({
      name: 'history-storytelling',
      version: '1.0.0',
    })
    expect([...registry.tools.keys()]).toEqual([
      'list_galleries',
      'list_albums',
      'search_story_moments',
      'get_album_story',
      'get_people_story_index',
      'get_on_this_day_story',
    ])
    expect([...registry.resources.keys()]).toEqual([
      'history-overview',
      'history-storytelling-guide',
    ])
    expect([...registry.prompts.keys()]).toEqual(['write-history-story'])
    expect(registry.transportInstances).toHaveLength(1)
    expect(registry.connect).toHaveBeenCalledWith(registry.transportInstances[0])
  })

  test('accepts country and region location queries in search_story_moments and forwards them', async () => {
    await loadStorytellingModule()

    const searchTool = registry.tools.get('search_story_moments')
    expect(searchTool).toBeDefined()

    const parsed = searchTool?.config.inputSchema.parse({
      gallery: 'demo',
      country: 'Japan',
      region: 'Aichi',
    })

    expect(parsed).toEqual({
      gallery: 'demo',
      country: 'Japan',
      region: 'Aichi',
      limit: 8,
    })

    const output = await searchTool?.handler(parsed)

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
    await loadStorytellingModule()

    const searchTool = registry.tools.get('search_story_moments')
    expect(searchTool).toBeDefined()

    const parsed = searchTool?.config.inputSchema.parse({ region: 'Aichi' })

    expect(parsed).toEqual({ region: 'Aichi', limit: 8 })
    await searchTool?.handler(parsed)

    expect(searchStoryMoments).toHaveBeenCalledWith({ region: 'Aichi', limit: 8 })
  })

  test('storytelling guide advertises location-oriented queries', async () => {
    await loadStorytellingModule()

    const guide = registry.resources.get('history-storytelling-guide')
    expect(guide).toBeDefined()

    const output = await guide?.handler(new URL('history://storytelling-guide'))
    const text = output?.contents[0]?.text ?? ''

    expect(text).toContain('Show me story moments from Japan.')
    expect(text).toContain('Find narrative moments in Aichi, Japan.')
  })
})
