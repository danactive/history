import { McpServer } from '@modelcontextprotocol/server'
import { StdioServerTransport } from '@modelcontextprotocol/server/stdio'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import * as z from 'zod/v4'
import getAlbums from '../src/lib/albums'
import getGalleries from '../src/lib/galleries'
import {
  buildAlbumStory,
  buildStorytellingOverview,
  getOnThisDayStory,
  getPeopleStoryIndex,
  searchStoryMoments,
} from '../src/lib/storytelling'
import config from '../src/models/config'
import { generatedGallerySchema } from '../src/types/generated'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
process.chdir(projectRoot)

const server = new McpServer({
  name: 'history-storytelling',
  version: '1.0.0',
})

const gallerySchema = generatedGallerySchema.describe('Gallery name from the local archive.')
const albumSchema = z.string().describe('Album name inside the selected gallery.')

server.registerTool(
  'list_galleries',
  {
    title: 'List Galleries',
    description: 'List available local galleries that can be queried for stories.',
    annotations: { readOnlyHint: true },
  },
  async () => {
    const result = await getGalleries()
    return {
      content: [{ type: 'text', text: `Available galleries: ${result.galleries.join(', ')}` }],
      structuredContent: result,
    }
  },
)

server.registerTool(
  'list_albums',
  {
    title: 'List Albums',
    description: 'List albums in a gallery with their title, subtitle, and year span.',
    inputSchema: z.object({
      gallery: gallerySchema,
    }),
    annotations: { readOnlyHint: true },
  },
  async ({ gallery }) => {
    const albums = await getAlbums(gallery)
    const output = albums[gallery]
    return {
      content: [{ type: 'text', text: `Found ${output.albums.length} album(s) in ${gallery}.` }],
      structuredContent: output,
    }
  },
)

server.registerTool(
  'search_story_moments',
  {
    title: 'Search Story Moments',
    description: 'Search across archive items for moments that are strong narrative candidates.',
    inputSchema: z.object({
      query: z.string().optional().describe('Free-text story query such as a place, theme, or event.'),
      gallery: gallerySchema.optional(),
      album: albumSchema.optional(),
      person: z.string().optional().describe('Person name to require in the result set.'),
      city: z.string().optional().describe('City or location fragment to require in the result set.'),
      year: z.string().optional().describe('Four-digit year to require in the result set.'),
      limit: z.number().int().min(1).max(25).default(8).describe('Maximum number of story moments to return.'),
    }).refine(
      value => Boolean(value.query || value.album || value.person || value.city || value.year),
      'Provide at least one of query, album, person, city, or year.',
    ),
    annotations: { readOnlyHint: true },
  },
  async (input) => {
    const output = await searchStoryMoments({
      ...input,
    })
    const topLine = output.matches[0]
      ? `Top match: ${output.matches[0].caption} (${output.matches[0].filename})`
      : output.summary

    return {
      content: [{ type: 'text', text: `${output.summary}\n${topLine}` }],
      structuredContent: output,
    }
  },
)

server.registerTool(
  'get_album_story',
  {
    title: 'Get Album Story',
    description: 'Return the narrative context and strongest highlights for a single album.',
    inputSchema: z.object({
      gallery: gallerySchema,
      album: albumSchema,
      limit: z.number().int().min(1).max(25).default(8).describe('Maximum number of highlights to return.'),
    }),
    annotations: { readOnlyHint: true },
  },
  async ({ gallery, album, limit }) => {
    const output = await buildAlbumStory(gallery, album, limit)
    return {
      content: [{ type: 'text', text: output.summary }],
      structuredContent: output,
    }
  },
)

server.registerTool(
  'get_people_story_index',
  {
    title: 'Get People Story Index',
    description: 'List people in a gallery with appearance counts and date spans.',
    inputSchema: z.object({
      gallery: gallerySchema.default(config.defaultGallery),
    }),
    annotations: { readOnlyHint: true },
  },
  async ({ gallery }) => {
    const output = await getPeopleStoryIndex(gallery)
    return {
      content: [{ type: 'text', text: output.summary }],
      structuredContent: output,
    }
  },
)

server.registerTool(
  'get_on_this_day_story',
  {
    title: 'Get On This Day Story',
    description: 'Find moments from the same month and day across years for a gallery.',
    inputSchema: z.object({
      gallery: gallerySchema.default(config.defaultGallery),
      monthDay: z.string().regex(/^\d{2}-\d{2}$/).optional().describe('Month-day in MM-DD format. Defaults to today.'),
      limit: z.number().int().min(1).max(25).default(8).describe('Maximum number of matches to return.'),
    }),
    annotations: { readOnlyHint: true },
  },
  async ({ gallery, monthDay, limit }) => {
    const output = await getOnThisDayStory(gallery, monthDay, limit)
    return {
      content: [{ type: 'text', text: output.summary }],
      structuredContent: output,
    }
  },
)

server.registerResource(
  'history-overview',
  'history://overview',
  {
    title: 'History Storytelling Overview',
    description: 'Overview of the local history archive and recommended storytelling workflow.',
    mimeType: 'text/plain',
  },
  async (uri) => ({
    contents: [{
      uri: uri.href,
      text: await buildStorytellingOverview(),
    }],
  }),
)

server.registerResource(
  'history-storytelling-guide',
  'history://storytelling-guide',
  {
    title: 'Storytelling Query Guide',
    description: 'Examples of strong storytelling queries for the archive.',
    mimeType: 'text/plain',
  },
  async (uri) => ({
    contents: [{
      uri: uri.href,
      text: [
        'Try questions like:',
        '- Find a story about Vancouver food memories.',
        '- Show me the strongest narrative moments involving Mister Gingerbread.',
        '- Build a short travel story from the sample album.',
        '- What happened on this day across years?',
        '',
        'Recommended tool order:',
        '1. list_galleries',
        '2. list_albums',
        '3. search_story_moments or get_on_this_day_story',
        '4. get_album_story',
        '5. write-history-story prompt',
      ].join('\n'),
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
          'Before writing, call the storytelling tools to gather factual evidence.',
          'Cite concrete albums, dates, places, and people from the tool results.',
          'If the archive evidence is thin, say so instead of inventing details.',
        ].join(' '),
      },
    }],
  }),
)

async function main() {
  const transport = new StdioServerTransport()
  await server.connect(transport)
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.stack ?? error.message : String(error)
  console.error(message)
  process.exit(1)
})
