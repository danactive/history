import { createMcpHandler, McpServer, ResourceTemplate } from '@modelcontextprotocol/server'
import { serveStdio } from '@modelcontextprotocol/server/stdio'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import * as z from 'zod/v4'
import getGalleries from '../src/lib/galleries'
import { getDefaultMonthDay, monthDaySchema } from '../src/lib/monthDay'
import {
  buildAlbumDetailsText,
  buildDateDetailsText,
  buildGalleriesDetailsText,
  buildGalleryDetailsText,
  buildPeopleInventoryText,
  buildPersonDetailsText,
  getStorytellingDefaultGallery,
} from '../src/lib/storytelling'
import { generatedGalleries, generatedGallerySchema } from '../src/types/generated'

const modulePath = fileURLToPath(import.meta.url)
const projectRoot = path.resolve(path.dirname(modulePath), '..')

function ensureProjectRoot() {
  if (process.cwd() !== projectRoot) {
    process.chdir(projectRoot)
  }
}

const gallerySchema = generatedGallerySchema.describe(
  'Select a gallery collection of albums to query for stories. If not provided, the default gallery will be used.',
)
const storytellingDefaultGallery = getStorytellingDefaultGallery(generatedGalleries)
const gallerySchemaWithDefault = gallerySchema.default(storytellingDefaultGallery)
const albumSchema = z.string().min(1).describe(
  'Exact album name in the selected gallery. Omit it to discover valid names through the linked History Gallery resource.',
)
const personSchema = z.string().min(1).describe(
  'Exact person name in the selected gallery. Omit it to discover valid names through the linked People inventory.',
)
function stringifyLines(lines: Array<string | null | undefined>) {
  return lines.filter((line): line is string => Boolean(line)).join('\n')
}

function parseGallery(value: unknown) {
  return generatedGallerySchema.parse(value ?? storytellingDefaultGallery)
}

function getTemplatePathSegments(uri: URL) {
  return uri.pathname.split('/').filter(Boolean).map(segment => decodeURIComponent(segment))
}

function getGalleryFromTemplate(uri: URL, value: unknown, segmentIndex = 0) {
  const pathSegments = getTemplatePathSegments(uri)
  return parseGallery(value ?? pathSegments[segmentIndex])
}

const GALLERIES_URI = 'history://galleries'
const GALLERY_TEMPLATE = 'history://gallery/{gallery}'
const PEOPLE_TEMPLATE = 'history://people/{gallery}'

function buildGalleryResourceUri(gallery: string) {
  return `history://gallery/${encodeURIComponent(gallery)}`
}

function buildPeopleResourceUri(gallery: string) {
  return `history://people/${encodeURIComponent(gallery)}`
}

const SERVER_INSTRUCTIONS = stringifyLines([
  'Use this MCP server to explore the history photo/video archive',
  [
    'Resources are inventories: read history://galleries, then read history://gallery/{gallery}',
    'to discover album names or history://people/{gallery} to discover person names.',
  ].join(' '),
  'Use get_album_story, get_on_this_day_story, or get_person_story for archive details.',
  'Keep stories grounded in returned albums, dates, places, and people.',
])

function formatToolError(error: unknown) {
  if (error instanceof Error) {
    return error.message
  }

  return String(error)
}

type ToolResourceLink = {
  uri: string
  name: string
  title?: string
  description?: string
  mimeType?: string
}

function toolResult<TStructuredContent extends Record<string, unknown>>({
  text,
  structured,
  resourceLink,
}: {
  text: string
  structured: TStructuredContent
  resourceLink?: ToolResourceLink
}) {
  return {
    content: [
      { type: 'text' as const, text },
      ...(resourceLink ? [{ type: 'resource_link' as const, ...resourceLink }] : []),
    ],
    structuredContent: structured,
  }
}

function toolErrorResult(error: unknown) {
  return {
    isError: true,
    content: [{ type: 'text' as const, text: `Error: ${formatToolError(error)}` }],
  }
}

function withToolErrorHandling<TArgs extends Record<string, unknown>>(
  handler: (args: TArgs) => Promise<{ text: string, structured: Record<string, unknown>, resourceLink?: ToolResourceLink }>,
) {
  return async (args: TArgs) => {
    try {
      const result = await handler(args)
      return toolResult(result)
    } catch (error: unknown) {
      return toolErrorResult(error)
    }
  }
}

function createStorytellingServer() {
  ensureProjectRoot()

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
      description: [
        'Return the narrative context and highlights for an album.',
        'Omit album to discover valid names through the linked History Gallery inventory.',
      ].join(' '),
      inputSchema: z.object({
        gallery: gallerySchemaWithDefault,
        album: albumSchema.optional(),
      }),
      annotations: { readOnlyHint: true },
    },
    withToolErrorHandling(async ({ gallery, album }) => {
      if (!album) {
        const resourceUri = buildGalleryResourceUri(gallery)
        return {
          text: `Read the linked History Gallery resource to discover album names in ${gallery}, then call get_album_story with the selected album.`,
          structured: { gallery, resourceUri },
          resourceLink: {
            uri: resourceUri,
            name: `Album inventory for ${gallery}`,
            title: 'History Gallery',
            description: `Album names and summaries for the ${gallery} gallery.`,
            mimeType: 'text/plain',
          },
        }
      }

      return {
        text: await buildAlbumDetailsText(gallery, album, 8),
        structured: {
          gallery,
          album,
        },
      }
    }),
  )

  server.registerTool(
    'get_on_this_day_story',
    {
      title: 'Get memories On This Day Story',
      description:
        'Return on-this-day memory details, including dates, albums, captions, locations, and people.',
      inputSchema: z.object({
        gallery: gallerySchemaWithDefault,
        monthDay: monthDaySchema.optional(),
      }),
      annotations: { readOnlyHint: true },
    },
    withToolErrorHandling(async ({ gallery, monthDay }) => {
      const resolvedMonthDay = monthDay ?? getDefaultMonthDay()
      return {
        text: await buildDateDetailsText(gallery, resolvedMonthDay, 8),
        structured: {
          gallery,
          monthDay: resolvedMonthDay,
        },
      }
    }),
  )

  server.registerTool(
    'get_person_story',
    {
      title: 'Get Person Story',
      description: [
        'Return appearance counts, date range, albums, and a graphical interface link for a person.',
        'Omit person to discover valid names through the linked People inventory.',
      ].join(' '),
      inputSchema: z.object({
        gallery: gallerySchemaWithDefault,
        person: personSchema.optional(),
      }),
      annotations: { readOnlyHint: true },
    },
    withToolErrorHandling(async ({ gallery, person }) => {
      if (!person) {
        const resourceUri = buildPeopleResourceUri(gallery)
        return {
          text: `Read the linked People inventory to discover person names in ${gallery}, then call get_person_story with the selected person.`,
          structured: { gallery, resourceUri },
          resourceLink: {
            uri: resourceUri,
            name: `People in ${gallery}`,
            title: 'History People',
            description: `Person names and appearance counts for the ${gallery} gallery.`,
            mimeType: 'text/plain',
          },
        }
      }

      return {
        text: await buildPersonDetailsText(gallery, person),
        structured: { gallery, person },
      }
    }),
  )

  server.registerResource(
    'history-galleries',
    GALLERIES_URI,
    {
      title: 'History Photo Galleries',
      description: 'List every photo gallery, including its default or non-default status and album count.',
      mimeType: 'text/plain',
    },
    async (uri) => ({
      contents: [{
        uri: uri.href,
        text: await buildGalleriesDetailsText(),
      }],
    }),
  )

  server.registerResource(
    'history-people',
    new ResourceTemplate(PEOPLE_TEMPLATE, {
      list: async () => {
        const { galleries } = await getGalleries()
        return {
          resources: galleries.map((gallery) => ({
            uri: buildPeopleResourceUri(gallery),
            name: gallery,
          })),
        }
      },
    }),
    {
      title: 'History People',
      description: 'Person inventory and appearance counts for a specific photo gallery.',
      mimeType: 'text/plain',
    },
    async (uri, variables) => ({
      contents: [{
        uri: uri.href,
        text: await buildPeopleInventoryText(getGalleryFromTemplate(uri, variables.gallery, 0)),
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
            uri: buildGalleryResourceUri(gallery),
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
        text: await buildGalleryDetailsText(getGalleryFromTemplate(uri, variables.gallery, 0)),
      }],
    }),
  )

  server.registerPrompt(
    'story-from-history',
    {
      title: 'Story From History',
      description: [
        'Generate a grounded narrative from archive inventories and storytelling tools.',
        'Omit the query to discover the relevant inventory first.',
      ].join(' '),
      argsSchema: z.object({
        query: z.string().min(1).optional().describe('The story request to answer. Omit it to discover the relevant inventory first.'),
        gallery: gallerySchema.optional(),
        tone: z.enum(['documentary', 'warm', 'concise']).default('documentary').describe('Writing tone to use.'),
      }),
    },
    async ({ query, gallery, tone }) => {
      const inventoryUri = gallery ? buildGalleryResourceUri(gallery) : GALLERIES_URI
      const inventoryLink = gallery
        ? {
            uri: inventoryUri,
            name: `Album inventory for ${gallery}`,
            title: 'History Gallery',
            description: `Album names for the ${gallery} gallery.`,
          }
        : {
            uri: inventoryUri,
            name: 'Photo gallery inventory',
            title: 'History Photo Galleries',
            description: 'Available galleries and their album counts.',
          }

      const text = query
        ? [
            `Generate a ${tone} story for this archive request: ${query}.`,
            gallery ? `Focus on gallery: ${gallery}.` : 'Use any relevant gallery.',
            `Read ${GALLERIES_URI} and a relevant history://gallery/{gallery} inventory before composing the response.`,
            'Call get_album_story, get_on_this_day_story, or get_person_story when relevant to the request.',
            'Use only archive evidence returned by the resources and tools.',
            'Cite concrete albums, dates, places, and people from the tool results.',
            'If the archive evidence is thin or incomplete, say so instead of inventing details.',
          ].join(' ')
        : 'Read the linked inventory to discover galleries or album names, then call this prompt again with a story request.'

      return {
        messages: [
          { role: 'user' as const, content: { type: 'resource_link' as const, ...inventoryLink } },
          { role: 'user' as const, content: { type: 'text' as const, text } },
        ],
      }
    },
  )

  return server
}

function createStorytellingHttpHandler() {
  return createMcpHandler(createStorytellingServer, { responseMode: 'sse' })
}

function main() {
  serveStdio(createStorytellingServer)
}

if (process.argv[1] && path.resolve(process.argv[1]) === modulePath) {
  main()
}

export { createStorytellingHttpHandler, createStorytellingServer }
