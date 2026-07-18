import { McpServer, ResourceTemplate } from '@modelcontextprotocol/server'
import { StdioServerTransport } from '@modelcontextprotocol/server/stdio'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import * as z from 'zod/v4'
import getAlbums from '../src/lib/albums'
import getGalleries from '../src/lib/galleries'
import { buildPersonGuiHref, buildTodayGuiHref, getDefaultMonthDay, monthDaySchema, parseMonthDay } from '../src/lib/monthDay'
import {
  buildAlbumStory,
  buildStorytellingOverview,
  getOnThisDayStory,
  getPeopleStoryIndex,
} from '../src/lib/storytelling'
import { formatCountedPeople } from '../src/models/storytelling'
import config from '../src/models/config'
import { generatedGallerySchema } from '../src/types/generated'

const modulePath = fileURLToPath(import.meta.url)
const projectRoot = path.resolve(path.dirname(modulePath), '..')
process.chdir(projectRoot)

const gallerySchema = generatedGallerySchema.describe(
  'Select a gallery collection of albums to query for stories. If not provided, the default gallery will be used.',
)
const gallerySchemaWithDefault = gallerySchema.default(config.defaultGallery)
const albumSchema = z.string().describe('Album name inside the selected gallery.')
function stringifyLines(lines: Array<string | null | undefined>) {
  return lines.filter((line): line is string => Boolean(line)).join('\n')
}

function parseGallery(value: unknown) {
  return generatedGallerySchema.parse(value ?? config.defaultGallery)
}

function decodeTemplateValue(value: unknown) {
  return typeof value === 'string' ? decodeURIComponent(value) : ''
}

function getTemplatePathSegments(uri: URL) {
  return uri.pathname.split('/').filter(Boolean).map(segment => decodeURIComponent(segment))
}

function getGalleryFromTemplate(uri: URL, value: unknown, segmentIndex = 0) {
  const pathSegments = getTemplatePathSegments(uri)
  return parseGallery(value ?? pathSegments[segmentIndex])
}

function getStringFromTemplate(uri: URL, value: unknown, segmentIndex: number) {
  if (typeof value === 'string' && value.length > 0) {
    return decodeTemplateValue(value)
  }

  const pathSegments = getTemplatePathSegments(uri)
  return pathSegments[segmentIndex] ?? ''
}

const GUIDE_URI = 'history://guide'
const GALLERIES_URI = 'history://galleries'
const GALLERY_TEMPLATE = 'history://gallery/{gallery}'
const ALBUM_TEMPLATE = 'history://album/{gallery}/{album}'
const PERSON_TEMPLATE = 'history://person/{gallery}/{name}'
const DAY_TEMPLATE = 'history://day/{gallery}/{monthDay}'
const SERVER_INSTRUCTIONS = stringifyLines([
  'Use this MCP server to explore the history photo/video archive',
  'Recommended order: read history://galleries, then a gallery or album resource, then call get_on_this_day_story or get_album_story as needed.',
  'Keep stories grounded in returned albums, dates, places, and people.',
])

function formatToolError(error: unknown) {
  if (error instanceof Error) {
    return error.message
  }

  return String(error)
}

function toolResult<TStructuredContent extends Record<string, unknown>>({
  text,
  structured,
}: {
  text: string
  structured: TStructuredContent
}) {
  return {
    content: [{ type: 'text' as const, text }],
    structuredContent: structured,
  }
}

function toolErrorResult(error: unknown) {
  return {
    isError: true,
    content: [{ type: 'text' as const, text: `Error: ${formatToolError(error)}` }],
  }
}

function withToolErrorHandling<TArgs extends Record<string, unknown>, TResult extends Record<string, unknown>>(
  handler: (args: TArgs) => Promise<{ text: string, structured: TResult }>,
) {
  return async (args: TArgs) => {
    try {
      const result = await handler(args)
      return toolResult({ text: result.text, structured: result.structured })
    } catch (error: unknown) {
      return toolErrorResult(error)
    }
  }
}

async function buildStorytellingGuide() {
  const overview = await buildStorytellingOverview()
  return stringifyLines([
    overview,
    '',
    'Browse resources like:',
    `- ${GALLERIES_URI}`,
    '- history://gallery/demo',
    '- history://album/demo/sample',
    '- history://person/demo/Mister%20Gingerbread',
    '- history://day/demo/01-02',
    '',
    'Recommended workflow:',
    `1. Read ${GALLERIES_URI} to discover galleries.`,
    '2. Read a gallery or album resource for grounded archive context.',
    '3. Optionally call get_album_story or get_on_this_day_story for curated summaries.',
    '4. Use the write-history-story prompt to turn the evidence into prose.',
  ])
}

async function buildGalleriesResource() {
  const { galleries } = await getGalleries()
  const counts = await Promise.all(galleries.map(async (gallery) => {
    const albums = await getAlbums(gallery)
    return `${gallery}: ${albums[gallery].albums.length} album(s)`
  }))

  return stringifyLines([
    'Available galleries',
    ...counts,
  ])
}

async function buildGalleryResource(gallery: z.infer<typeof generatedGallerySchema>) {
  const albumNames = await getAlbums(gallery)
  const { albums } = albumNames[gallery]
  return stringifyLines([
    `Gallery is ${gallery}`,
    `Albums: ${albums.length}`,
    ...albums.map((album) => stringifyLines([
      `${album.name}: ${album.h1}${album.h2 ? ` — ${album.h2}` : ''}${album.year ? ` (${album.year})` : ''}`,
      album.search ? `with keywords ${album.search}` : null,
    ])),
  ])
}

async function buildPersonResource(gallery: z.infer<typeof generatedGallerySchema>, name: string) {
  const output = await getPeopleStoryIndex(gallery)
  const person = output.people.find((candidate) => candidate.name === name)
  if (!person) {
    throw new ReferenceError(`No person named ${name} was found in gallery ${gallery}`)
  }

  const guiHref = buildPersonGuiHref(gallery, person.name)

  return stringifyLines([
    `Person ${person.name}`,
    `Gallery is ${gallery}`,
    `Appearances: ${person.appearances}`,
    `First seen: ${person.firstSeen ?? 'unknown'}`,
    `Last seen: ${person.lastSeen ?? 'unknown'}`,
    `Date of birth: ${person.dateOfBirth ?? 'unknown'}`,
    `Albums: ${person.albums.join(', ') || 'none'}`,
    `GUI: ${guiHref}`,
  ])
}

function createStorytellingServer() {
  const server = new McpServer({
    name: 'history-storytelling',
    version: '1.0.0',
  }, {
    instructions: SERVER_INSTRUCTIONS,
  })

  server.registerTool(
    'get_album_story',
    {
      title: 'Get Album Story',
      description: 'Return the narrative context and strongest highlights for a single album.',
      inputSchema: z.object({
        gallery: gallerySchemaWithDefault,
        album: albumSchema,
        limit: z.number().int().min(1).max(25).default(8).describe('Maximum number of highlights to return.'),
      }),
      annotations: { readOnlyHint: true },
    },
    withToolErrorHandling(async ({ gallery, album, limit }) => {
      const output = await buildAlbumStory(gallery, album, limit)
      return {
        text: output.summary,
        structured: output,
      }
    }),
  )

  server.registerTool(
    'get_on_this_day_story',
    {
      title: 'Get On This Day Story',
      description: 'Find moments from the same month and day across years for a gallery.',
      inputSchema: z.object({
        gallery: gallerySchemaWithDefault,
        monthDay: monthDaySchema.optional(),
        limit: z.number().int().min(1).max(25).default(8).describe('Maximum number of matches to return.'),
      }),
      annotations: { readOnlyHint: true },
    },
    withToolErrorHandling(async ({ gallery, monthDay, limit }) => {
      const output = await getOnThisDayStory(gallery, monthDay, limit)
      return {
        text: output.summary,
        structured: output,
      }
    }),
  )

  server.registerResource(
    'history-galleries',
    GALLERIES_URI,
    {
      title: 'History Photo Galleries',
      description: 'List all available photo gallery collections in the local archive.',
      mimeType: 'text/plain',
    },
    async (uri) => ({
      contents: [{
        uri: uri.href,
        text: await buildGalleriesResource(),
      }],
    }),
  )

  server.registerResource(
    'history-gallery',
    new ResourceTemplate(GALLERY_TEMPLATE, {
      list: async () => {
        const { galleries } = await getGalleries()
        return {
          resources: galleries.map((gallery) => ({
            uri: `history://gallery/${encodeURIComponent(gallery)}`,
            name: gallery,
          })),
        }
      },
    }),
    {
      title: 'History Gallery',
      description: 'Album inventory and summary for a specific photo gallery.',
      mimeType: 'text/plain',
    },
    async (uri, variables) => ({
      contents: [{
        uri: uri.href,
        text: await buildGalleryResource(getGalleryFromTemplate(uri, variables.gallery, 0)),
      }],
    }),
  )

  server.registerResource(
    'history-album',
    new ResourceTemplate(ALBUM_TEMPLATE, {
      list: async () => {
        const { galleries } = await getGalleries()
        const resources = await Promise.all(galleries.map(async (gallery) => {
          const albums = await getAlbums(gallery)
          return albums[gallery].albums.map((album) => ({
            uri: `history://album/${encodeURIComponent(gallery)}/${encodeURIComponent(album.name)}`,
            name: `${gallery}/${album.name}`,
          }))
        }))

        return { resources: resources.flat() }
      },
    }),
    {
      title: 'History Album',
      description: 'Narrative summary and highlights for a specific album.',
      mimeType: 'text/plain',
    },
    async (uri, variables) => {
      const gallery = getGalleryFromTemplate(uri, variables.gallery, 0)
      const album = getStringFromTemplate(uri, variables.album, 1)
      const output = await buildAlbumStory(gallery, album, 8)
      return {
        contents: [{
          uri: uri.href,
          text: stringifyLines([
            output.summary,
            `Places: ${output.places.join(', ') || 'none'}`,
            `Persons: ${formatCountedPeople(output.personCounts)}`,
          ]),
        }],
      }
    },
  )

  server.registerResource(
    'history-person',
    new ResourceTemplate(PERSON_TEMPLATE, {
      list: async () => {
        const { galleries } = await getGalleries()
        const resources = await Promise.all(galleries.map(async (gallery) => {
          const people = await getPeopleStoryIndex(gallery)
          return people.people.map((person) => ({
            uri: `history://person/${encodeURIComponent(gallery)}/${encodeURIComponent(person.name)}`,
            name: `${gallery}/${person.name}`,
          }))
        }))

        return { resources: resources.flat() }
      },
    }),
    {
      title: 'History Person',
      description: 'Appearance counts and date span for a specific person within a gallery.',
      mimeType: 'text/plain',
    },
    async (uri, variables) => ({
      contents: [{
        uri: uri.href,
        text: await buildPersonResource(
          getGalleryFromTemplate(uri, variables.gallery, 0),
          getStringFromTemplate(uri, variables.name, 1),
        ),
      }],
    }),
  )

  server.registerResource(
    'history-day',
    new ResourceTemplate(DAY_TEMPLATE, {
      list: async () => {
        const { galleries } = await getGalleries()
        const today = getDefaultMonthDay()
        return {
          resources: galleries.map((gallery) => ({
            uri: `history://day/${encodeURIComponent(gallery)}/${today}`,
            name: `${gallery}/${today}`,
          })),
        }
      },
    }),
    {
      title: 'History On This Day',
      description: 'On-this-day matches for a gallery and month-day.',
      mimeType: 'text/plain',
    },
    async (uri, variables) => {
      const gallery = getGalleryFromTemplate(uri, variables.gallery, 0)
      const monthDay = parseMonthDay(getStringFromTemplate(uri, variables.monthDay, 1))
      const output = await getOnThisDayStory(gallery, monthDay, 8)
      const guiHref = buildTodayGuiHref(gallery, monthDay)
      return {
        contents: [{
          uri: uri.href,
          text: stringifyLines([
            output.summary,
            `GUI: ${guiHref}`,
            ...output.matches.map((match) => `${match.date ?? 'unknown'}: ${match.caption} (${match.filename})`),
          ]),
        }],
      }
    },
  )

  server.registerResource(
    'history-guide',
    GUIDE_URI,
    {
      title: 'History Storytelling Guide',
      description: 'Overview of the local history archive, example story queries, and a recommended workflow.',
      mimeType: 'text/plain',
    },
    async (uri) => ({
      contents: [{
        uri: uri.href,
        text: await buildStorytellingGuide(),
      }],
    }),
  )

  server.registerPrompt(
    'write-history-story',
    {
      title: 'Write History Story',
      description: 'Prompt template for turning tool output into a grounded personal-history story.',
      argsSchema: z.object({
        query: z.string().describe('The story request to answer.'),
        gallery: gallerySchema.optional(),
        tone: z.enum(['documentary', 'warm', 'concise']).default('documentary').describe('Writing tone to use.'),
      }),
    },
    async ({ query, gallery, tone }) => ({
      messages: [{
        role: 'user',
        content: {
          type: 'text',
          text: [
            `Write a ${tone} story for this archive request: ${query}.`,
            gallery ? `Focus on gallery: ${gallery}.` : 'Use any relevant gallery.',
            'Before writing, read the relevant history resources and call remaining storytelling tools when needed.',
            'Cite concrete albums, dates, places, and people from the tool results.',
            'If the archive evidence is thin, say so instead of inventing details.',
          ].join(' '),
        },
      }],
    }),
  )

  return server
}

async function main() {
  const server = createStorytellingServer()
  const transport = new StdioServerTransport()
  await server.connect(transport)
}

if (process.argv[1] && path.resolve(process.argv[1]) === modulePath) {
  main().catch((error: unknown) => {
    const message = error instanceof Error ? error.stack ?? error.message : String(error)
    console.error(message)
    process.exit(1)
  })
}

export { createStorytellingServer }
