import { readFileSync } from 'node:fs'
import { createMcpHandler, McpServer, ResourceTemplate } from '@modelcontextprotocol/server'
import { serveStdio } from '@modelcontextprotocol/server/stdio'
import { registerAppResource, registerAppTool, RESOURCE_MIME_TYPE } from '@modelcontextprotocol/ext-apps/server'
import mime from 'mime-types'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import * as z from 'zod/v4'
import getAlbum from '../src/lib/album'
import getAlbums from '../src/lib/albums'
import getGalleries from '../src/lib/galleries'
import { getDefaultMonthDay, guiOrigin as appOrigin, monthDaySchema } from '../src/lib/monthDay'
import config from '../src/models/config'
import {
  buildAlbumDetailsText,
  buildDateDetailsText,
  buildGalleriesDetailsText,
  buildGalleryInventoryText,
  buildPeopleInventoryText,
  buildPersonDetailsText,
  getStorytellingDefaultGallery,
  searchStoryMoments,
} from '../src/lib/storytelling'
import { storySearchInputSchema } from '../src/models/storytelling'
import type { Gallery, Item } from '../src/types/common'
import { getExt, getPrimaryFilename } from '../src/utils'
import { generatedGalleries, generatedGallerySchema } from '../src/types/generated'

const modulePath = fileURLToPath(import.meta.url)
const projectRoot = path.resolve(path.dirname(modulePath), '..')
const packageMetadata = JSON.parse(readFileSync(path.join(projectRoot, 'package.json'), 'utf8')) as {
  version?: string
}
const SERVER_NAME = 'history'
const SERVER_VERSION = packageMetadata.version ?? '0.0.0'

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
  const templateValue = typeof value === 'string'
    ? value.split('?')[0]
    : value

  return parseGallery(templateValue ?? pathSegments[segmentIndex])
}

function parsePositiveIntSearchParam(uri: URL, key: string, defaultValue: number, maxValue: number) {
  const rawValue = uri.searchParams.get(key)

  if (!rawValue) {
    return defaultValue
  }

  const parsedValue = Number.parseInt(rawValue, 10)

  if (!Number.isFinite(parsedValue) || parsedValue < 1) {
    return defaultValue
  }

  return Math.min(parsedValue, maxValue)
}

const GALLERIES_URI = 'history://galleries'
const GALLERY_TEMPLATE = 'history://gallery/{gallery}'
const PEOPLE_TEMPLATE = 'history://people/{gallery}'
const FALLBACK_VIDEO_EXTENSIONS = ['avi', 'm2ts', 'mov', 'mp4', 'mts', 'ogv', 'webm']
const MEDIA_APP_URI = 'ui://history/media-viewer.html'
const MAX_INLINE_PREVIEW_BYTES = 90_000
const MAX_APP_EMBED_PREVIEW_BYTES = 350_000
const extAppsRuntimeSource = readFileSync(
  path.join(projectRoot, 'node_modules', '@modelcontextprotocol', 'ext-apps', 'dist', 'src', 'app-with-deps.js'),
  'utf8',
)

function buildGalleryResourceUri(gallery: string) {
  return `history://gallery/${encodeURIComponent(gallery)}`
}

function buildPeopleResourceUri(gallery: string) {
  return `history://people/${encodeURIComponent(gallery)}`
}

function buildAbsoluteAppUrl(relativePath: string) {
  return new URL(relativePath, appOrigin).toString()
}

function buildAlbumSelectionUrl(gallery: string, album: string, select: string) {
  const url = new URL(`/${encodeURIComponent(gallery)}/${encodeURIComponent(album)}`, appOrigin)
  url.searchParams.set('select', select)
  return url.toString()
}

async function resolveAlbumName(gallery: Gallery, requestedAlbum: string) {
  const normalizedRequestedAlbum = requestedAlbum.trim().toLowerCase()
  const galleryAlbums = await getAlbums(gallery)
  const albums = galleryAlbums[gallery].albums
  type GalleryAlbumEntry = (typeof albums)[number]

  const exactNameMatch = albums.find((album: GalleryAlbumEntry) => album.name.toLowerCase() === normalizedRequestedAlbum)

  if (exactNameMatch) {
    return exactNameMatch.name
  }

  const exactLabelMatch = albums.find((album: GalleryAlbumEntry) => [album.h1, album.h2, album.search]
    .filter((value): value is string => Boolean(value))
    .some(value => value.toLowerCase() === normalizedRequestedAlbum))

  if (exactLabelMatch) {
    return exactLabelMatch.name
  }

  const tokenMatch = albums.find((album: GalleryAlbumEntry) => [album.h1, album.h2, album.search]
    .filter((value): value is string => Boolean(value))
    .some(value => value.toLowerCase().split(/,\s*/).includes(normalizedRequestedAlbum)))

  return tokenMatch?.name ?? requestedAlbum
}

function isVideoExtension(extension: string | null) {
  if (!extension) {
    return false
  }

  const configuredVideoTypes = [
    ...(config.supportedFileTypes?.video ?? []),
    ...(config.rawFileTypes?.video ?? []),
  ]

  return (configuredVideoTypes.length > 0 ? configuredVideoTypes : FALLBACK_VIDEO_EXTENSIONS).includes(extension)
}

function buildMediaItemPayload(item: Item) {
  const filename = getPrimaryFilename(item.filename)
  const extension = getExt(item.mediaPath)
  const mediaType = isVideoExtension(extension) ? 'video' : 'image'
  const embeddedPreview = buildEmbeddedPreview(item, MAX_APP_EMBED_PREVIEW_BYTES)

  return {
    filename,
    title: item.title,
    caption: item.caption,
    description: item.description,
    photoDate: item.photoDate,
    city: item.city,
    location: item.location,
    persons: item.persons?.map((person) => person.full) ?? [],
    mediaType,
    thumbUrl: buildAbsoluteAppUrl(item.thumbPath),
    photoUrl: buildAbsoluteAppUrl(item.photoPath),
    mediaUrl: buildAbsoluteAppUrl(item.mediaPath),
    embeddedPreviewUrl: embeddedPreview?.dataUrl ?? null,
    videoUrls: Array.isArray(item.videoPaths)
      ? item.videoPaths.map(buildAbsoluteAppUrl)
      : item.videoPaths
        ? [buildAbsoluteAppUrl(item.videoPaths)]
        : [],
  }
}

function buildMediaMetadataText(item: Item) {
  const location = [item.city, item.location].filter(Boolean).join(' / ')
  const people = item.persons?.map((person) => person.full).filter(Boolean).join(', ')

  return stringifyLines([
    'Archive metadata:',
    `Filename: ${getPrimaryFilename(item.filename)}`,
    `Date: ${item.photoDate || 'unknown'}`,
    `Location: ${location || 'unknown'}`,
    `Title: ${item.title || 'unknown'}`,
    `Caption: ${item.caption || 'unknown'}`,
    `Description: ${item.description || 'unknown'}`,
    `People: ${people || 'none recorded'}`,
  ])
}

function buildMediaNavigationItemPayload(item: Item) {
  const payload = buildMediaItemPayload(item)

  return {
    filename: payload.filename,
    title: payload.title,
    caption: payload.caption,
    mediaType: payload.mediaType,
    thumbUrl: payload.thumbUrl,
    select: payload.filename,
  }
}

function escapeInlineScriptSource(source: string) {
  return JSON.stringify(source).replace(/<\/script/gi, '<\\/script')
}

function buildMediaAppHtml() {
  const runtimeSourceLiteral = escapeInlineScriptSource(extAppsRuntimeSource)

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>History media viewer</title>
    <style>
      :root {
        color-scheme: light dark;
        --app-bg: var(--color-background-primary, #f6f4ef);
        --app-panel: var(--color-background-secondary, rgba(255, 255, 255, 0.78));
        --app-text: var(--color-text-primary, #1b1a17);
        --app-muted: var(--color-text-secondary, #5f5a4f);
        --app-border: var(--color-border-primary, rgba(27, 26, 23, 0.16));
        --app-accent: var(--color-text-accent, #0f766e);
      }

      * { box-sizing: border-box; }
      body {
        margin: 0;
        font-family: var(--font-sans, 'Iowan Old Style', 'Palatino Linotype', serif);
        background:
          radial-gradient(circle at top, rgba(15, 118, 110, 0.12), transparent 32%),
          linear-gradient(180deg, rgba(255, 255, 255, 0.75), transparent 38%),
          var(--app-bg);
        color: var(--app-text);
      }

      #app { min-height: 100vh; }
      .shell {
        max-width: 1120px;
        margin: 0 auto;
        padding: 24px;
      }
      .panel {
        background: var(--app-panel);
        border: 1px solid var(--app-border);
        border-radius: 20px;
        box-shadow: 0 18px 50px rgba(0, 0, 0, 0.08);
        backdrop-filter: blur(10px);
      }
      .hero {
        padding: 20px 22px 10px;
      }
      h1 {
        margin: 0;
        font-size: clamp(1.8rem, 4vw, 3rem);
        line-height: 1.05;
      }
      .caption, .hint, .status {
        color: var(--app-muted);
      }
      .hint, .status {
        margin: 10px 0 0;
        font-size: 0.95rem;
      }
      .nav {
        display: flex;
        gap: 12px;
        padding: 0 22px 18px;
      }
      button {
        appearance: none;
        border: 1px solid var(--app-border);
        background: rgba(255, 255, 255, 0.85);
        color: var(--app-text);
        padding: 10px 14px;
        border-radius: 999px;
        font: inherit;
        cursor: pointer;
      }
      button:disabled {
        cursor: not-allowed;
        opacity: 0.45;
      }
      .media-wrap {
        padding: 0 22px;
      }
      .media {
        width: 100%;
        max-height: 66vh;
        display: block;
        object-fit: contain;
        background: rgba(0, 0, 0, 0.08);
        border-radius: 18px;
      }
      .thumbs {
        list-style: none;
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(96px, 1fr));
        gap: 10px;
        padding: 18px 22px 8px;
        margin: 0;
      }
      .thumb {
        width: 100%;
        display: block;
        border-radius: 12px;
        aspect-ratio: 16 / 9;
        object-fit: cover;
      }
      .thumb-button {
        padding: 0;
        border-radius: 14px;
        overflow: hidden;
      }
      .thumb-button[aria-current="true"] {
        border-color: var(--app-accent);
        box-shadow: 0 0 0 2px color-mix(in srgb, var(--app-accent) 30%, transparent);
      }
      .details {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: 16px;
        padding: 16px 22px 24px;
      }
      .detail dt {
        color: var(--app-muted);
        font-size: 0.8rem;
        text-transform: uppercase;
        letter-spacing: 0.08em;
      }
      .detail dd {
        margin: 6px 0 0;
      }
    </style>
  </head>
  <body>
    <div id="app"></div>
    <script type="module">
      const runtimeSource = ${runtimeSourceLiteral};
      const runtimeUrl = URL.createObjectURL(new Blob([runtimeSource], { type: 'text/javascript' }));
      const {
        App,
        PostMessageTransport,
        applyDocumentTheme,
        applyHostStyleVariables,
        applyHostFonts,
      } = await import(runtimeUrl);
      URL.revokeObjectURL(runtimeUrl);

      const root = document.getElementById('app');
      const state = { app: null, payload: null, loading: false, error: null, inlinePreviewUrl: null, mediaResourceUrl: null };

      function extractInlinePreviewUrl(content) {
        const image = (content || []).find(block => block.type === 'image' && typeof block.data === 'string');

        if (!image) {
          return null;
        }

        const allowedTypes = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'];
        const mimeType = allowedTypes.includes(image.mimeType) ? image.mimeType : 'image/jpeg';
        return 'data:' + mimeType + ';base64,' + image.data;
      }

      function extractMediaResourceUrl(content) {
        const resource = (content || []).find(block => block.type === 'resource_link' && typeof block.uri === 'string');
        return resource?.uri || null;
      }

      function setStatus(message) {
        const status = document.getElementById('status');
        if (status) status.textContent = message || '';
      }

      function updateState(next) {
        Object.assign(state, next);
        render();
      }

      async function selectMedia(select) {
        if (!state.app || !state.payload || state.loading) return;

        updateState({ loading: true, error: null });
        try {
          const result = await state.app.callServerTool({
            name: 'get_album_media',
            arguments: {
              gallery: state.payload.gallery,
              album: state.payload.album,
              select,
            },
          });
          handleToolResult(result);
        } catch (error) {
          updateState({ loading: false, error: error instanceof Error ? error.message : String(error) });
        }
      }

      function createDetail(label, value) {
        const wrapper = document.createElement('div');
        wrapper.className = 'detail';
        const dt = document.createElement('dt');
        dt.textContent = label;
        const dd = document.createElement('dd');
        dd.textContent = value;
        wrapper.append(dt, dd);
        return wrapper;
      }

      function attachKeyboardNavigation(previous, next) {
        window.onkeydown = (event) => {
          const target = event.target;
          if (target instanceof HTMLElement) {
            const tagName = target.tagName;
            if (target.isContentEditable || tagName === 'INPUT' || tagName === 'SELECT' || tagName === 'TEXTAREA') {
              return;
            }
          }

          if (event.key === 'ArrowLeft' && previous) {
            event.preventDefault();
            void selectMedia(previous.select);
          }

          if (event.key === 'ArrowRight' && next) {
            event.preventDefault();
            void selectMedia(next.select);
          }
        };
      }

      function render() {
        root.textContent = '';

        const shell = document.createElement('main');
        shell.className = 'shell';
        const panel = document.createElement('section');
        panel.className = 'panel';
        shell.append(panel);

        const hero = document.createElement('header');
        hero.className = 'hero';
        const title = document.createElement('h1');
        title.textContent = state.payload?.item?.title || 'History media viewer';
        const caption = document.createElement('p');
        caption.className = 'caption';
        caption.textContent = state.payload?.item?.caption || 'Waiting for media selection...';
        const hint = document.createElement('p');
        hint.className = 'hint';
        hint.textContent = 'Use Left and Right arrow keys or the thumbnail strip to move through the album.';
        const status = document.createElement('p');
        status.className = 'status';
        status.id = 'status';
        status.textContent = state.loading ? 'Loading media…' : state.error || '';
        hero.append(title, caption, hint, status);
        panel.append(hero);

        if (!state.payload) {
          root.append(shell);
          return;
        }

        const { item, previous, next, items } = state.payload;
        const displayImageUrl = item.embeddedPreviewUrl || state.inlinePreviewUrl || item.photoUrl;
        attachKeyboardNavigation(previous, next);

        const nav = document.createElement('nav');
        nav.className = 'nav';
        nav.setAttribute('aria-label', 'Media navigation');
        const prevButton = document.createElement('button');
        prevButton.textContent = 'Previous';
        prevButton.disabled = !previous || state.loading;
        prevButton.onclick = () => previous && void selectMedia(previous.select);
        const nextButton = document.createElement('button');
        nextButton.textContent = 'Next';
        nextButton.disabled = !next || state.loading;
        nextButton.onclick = () => next && void selectMedia(next.select);
        nav.append(prevButton, nextButton);
        panel.append(nav);

        const mediaWrap = document.createElement('section');
        mediaWrap.className = 'media-wrap';
        if (item.mediaType === 'video') {
          const video = document.createElement('video');
          video.className = 'media';
          video.controls = true;
          video.poster = displayImageUrl;
          video.src = item.mediaUrl;
          mediaWrap.append(video);
        } else {
          const image = document.createElement('img');
          image.className = 'media';
          image.src = displayImageUrl;
          image.alt = item.caption || item.title || item.filename;
          mediaWrap.append(image);
        }
        panel.append(mediaWrap);

        if (state.mediaResourceUrl) {
          const link = document.createElement('a');
          link.href = state.mediaResourceUrl;
          link.textContent = 'Open full-resolution media';
          link.target = '_blank';
          link.rel = 'noreferrer noopener';
          link.style.display = 'inline-block';
          link.style.padding = '8px 22px 0';
          panel.append(link);
        }

        const thumbs = document.createElement('ul');
        thumbs.className = 'thumbs';
        for (const thumb of items) {
          const li = document.createElement('li');
          const button = document.createElement('button');
          button.className = 'thumb-button';
          button.type = 'button';
          button.setAttribute('aria-label', thumb.caption || thumb.title || thumb.filename);
          button.setAttribute('aria-current', String(thumb.select === state.payload.select));
          button.disabled = state.loading;
          button.onclick = () => void selectMedia(thumb.select);

          const img = document.createElement('img');
          img.className = 'thumb';
          img.src = thumb.thumbUrl;
          img.alt = thumb.caption || thumb.title || thumb.filename;
          button.append(img);
          li.append(button);
          thumbs.append(li);
        }
        panel.append(thumbs);

        const details = document.createElement('dl');
        details.className = 'details';
        details.append(
          createDetail('Gallery', state.payload.gallery),
          createDetail('Album', state.payload.album),
          createDetail('Filename', item.filename),
          createDetail('Date', item.photoDate || 'unknown'),
          createDetail('Location', item.location || item.city || 'unknown'),
          createDetail('People', item.persons.length > 0 ? item.persons.join(', ') : 'none'),
        );
        panel.append(details);

        root.append(shell);
      }

      function handleToolResult(result) {
        if (result.isError) {
          updateState({ loading: false, error: (result.content || []).map(block => block.text || '').join('\n') || 'Unable to load media.' });
          return;
        }

        updateState({
          loading: false,
          error: null,
          payload: result.structuredContent || null,
          inlinePreviewUrl: extractInlinePreviewUrl(result.content),
          mediaResourceUrl: extractMediaResourceUrl(result.content),
        });
      }

      const app = new App({ name: 'history-media-viewer', version: '1.0.0' }, {});
      state.app = app;
      app.ontoolresult = handleToolResult;
      app.onhostcontextchanged = (ctx) => {
        if (ctx.theme) applyDocumentTheme(ctx.theme);
        if (ctx.styles?.variables) applyHostStyleVariables(ctx.styles.variables);
        if (ctx.styles?.css?.fonts) applyHostFonts(ctx.styles.css.fonts);
        if (ctx.safeAreaInsets) {
          document.body.style.padding = [ctx.safeAreaInsets.top, ctx.safeAreaInsets.right, ctx.safeAreaInsets.bottom, ctx.safeAreaInsets.left]
            .map((value) => value + 'px')
            .join(' ');
        }
      };

      render();
      await app.connect(new PostMessageTransport(window.parent, window.parent));
    </script>
  </body>
</html>`
}

const SERVER_INSTRUCTIONS = stringifyLines([
  'Use this MCP server to explore the history photo/video archive',
  [
    'Resources are inventories: read history://galleries, then read history://gallery/{gallery}',
    'to discover album names or history://people/{gallery} to discover person names.',
  ].join(' '),
  [
    'Use search_story_moments first for free-text discovery, then use get_album_story,',
    'get_album_media, get_on_this_day_story, or get_person_story for exact follow-up details.',
  ].join(' '),
  'Keep stories grounded in returned albums, dates, places, and people.',
])

function buildStorySearchText(result: Awaited<ReturnType<typeof searchStoryMoments>>) {
  return [
    result.summary,
    '',
    '## Matches',
    ...(result.matches.length > 0
      ? result.matches.flatMap(match => [
          `- Album: ${match.album ?? 'unknown'} | File: ${match.filename} | Date: ${match.date ?? 'unknown'}`,
          `  Title: ${match.title}`,
          `  Location: ${[match.city, match.location].filter(Boolean).join(' / ') || 'unknown'}`,
          `  People: ${match.persons.join(', ') || 'none'}`,
        ])
      : ['- none']),
    '',
    'Use get_album_media with the exact album and file from a match to view the photo or video.',
    'Use get_album_story with the exact album from a match to read the broader narrative context.',
  ].join('\n')
}

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

type ToolContentBlock =
  | { type: 'text'; text: string; annotations?: { audience?: Array<'user' | 'assistant'>; priority?: number } }
  | { type: 'image'; data: string; mimeType: string; annotations?: { audience?: Array<'user' | 'assistant'>; priority?: number } }
  | ({ type: 'resource_link'; annotations?: { audience?: Array<'user' | 'assistant'>; priority?: number } } & ToolResourceLink)

function toolResult<TStructuredContent extends Record<string, unknown>>({
  text,
  content,
  structured,
  resourceLink,
}: {
  text?: string
  content?: ToolContentBlock[]
  structured: TStructuredContent
  resourceLink?: ToolResourceLink
}) {
  return {
    content: content ?? [
      { type: 'text' as const, text: text ?? '' },
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
  handler: (args: TArgs) => Promise<{
    text?: string
    content?: ToolContentBlock[]
    structured: Record<string, unknown>
    resourceLink?: ToolResourceLink
  }>,
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

function buildMediaResourceLinkContent(gallery: string, album: string, item: Item): ToolContentBlock {
  const filename = getPrimaryFilename(item.filename)
  const uri = buildAlbumSelectionUrl(gallery, album, filename)

  return {
    type: 'resource_link',
    uri,
    name: album,
    title: item.title || filename,
    description: item.caption || item.description || `Selected media item ${filename}`,
    mimeType: 'text/html',
    annotations: {
      audience: ['user', 'assistant'],
      priority: 0.9,
    },
  }
}

function buildEmbeddedPreview(item: Item, maxBytes: number) {
  const previewPaths = [item.photoPath, item.thumbPath].filter(Boolean)

  for (const previewPath of previewPaths) {
    const absolutePath = path.join(projectRoot, 'public', previewPath.replace(/^\//, ''))

    try {
      const buffer = readFileSync(absolutePath)

      if (buffer.byteLength > maxBytes) {
        continue
      }

      const detectedMimeType = mime.lookup(previewPath)
      const mimeType = typeof detectedMimeType === 'string' ? detectedMimeType : 'image/jpeg'
      const data = buffer.toString('base64')

      return {
        data,
        mimeType,
        dataUrl: 'data:' + mimeType + ';base64,' + data,
      }
    } catch {
      continue
    }
  }

  return null
}

function buildInlinePreviewContent(item: Item): ToolContentBlock | null {
  const preview = buildEmbeddedPreview(item, MAX_INLINE_PREVIEW_BYTES)

  if (!preview) {
    return null
  }

  return {
    type: 'image',
    data: preview.data,
    mimeType: preview.mimeType,
    annotations: {
      audience: ['user', 'assistant'],
      priority: 0.8,
    },
  }
}

function buildMediaToolContentBlocks(gallery: string, album: string, item: Item, message: string): ToolContentBlock[] {
  const primaryText = stringifyLines([message, '', buildMediaMetadataText(item)])
  const mediaResourceLink = buildMediaResourceLinkContent(gallery, album, item)
  const inlinePreview = buildInlinePreviewContent(item)

  return [
    {
      type: 'text',
      text: primaryText,
      annotations: {
        audience: ['user', 'assistant'],
        priority: 1,
      },
    },
    ...(inlinePreview ? [inlinePreview] : []),
    mediaResourceLink,
  ]
}

function createStorytellingServer() {
  ensureProjectRoot()

  const server = new McpServer({
    name: SERVER_NAME,
    version: SERVER_VERSION,
  }, {
    instructions: SERVER_INSTRUCTIONS,
  })
  const appToolServer = { registerTool: server.registerTool.bind(server) } as unknown as Parameters<typeof registerAppTool>[0]
  const appResourceServer = { registerResource: server.registerResource.bind(server) } as unknown as Parameters<typeof registerAppResource>[0]

  server.registerTool(
    'search_story_moments',
    {
      title: 'Search Story Moments',
      description: [
        'Search the archive by free-text themes, place names, people, countries, regions, years, or exact album names.',
        'Use this first when you do not already know the exact album name or filename.',
      ].join(' '),
      inputSchema: storySearchInputSchema,
      annotations: { readOnlyHint: true },
    },
    withToolErrorHandling(async ({ gallery, album, ...rest }) => {
      const resolvedGallery = parseGallery(gallery)
      const resolvedAlbum = album ? await resolveAlbumName(resolvedGallery, album) : undefined
      const result = await searchStoryMoments({
        ...rest,
        gallery: resolvedGallery,
        ...(resolvedAlbum ? { album: resolvedAlbum } : {}),
      })

      return {
        text: buildStorySearchText(result),
        structured: {
          ...result,
          gallery: resolvedGallery,
          requestedAlbum: album ?? null,
        },
      }
    }),
  )

  server.registerTool(
    'get_album_story',
    {
      title: 'Get Album Story',
      description: [
        'Return the narrative context, configured gallery keywords, and highlights for an album.',
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

      const resolvedAlbum = await resolveAlbumName(gallery, album)

      return {
        text: await buildAlbumDetailsText(gallery, resolvedAlbum, 8),
        structured: {
          gallery,
          album: resolvedAlbum,
          requestedAlbum: album,
        },
      }
    }),
  )

  registerAppTool(
    appToolServer,
    'get_album_media',
    {
      title: 'Get Album Media',
      description: [
        'Return one selected photo or video from an album and open an interactive MCP App when supported by the client.',
        'Omit select to return the first item in the album.',
      ].join(' '),
      inputSchema: z.object({
        gallery: gallerySchemaWithDefault,
        album: albumSchema,
        select: z.string().min(1).optional().describe(
          'Exact filename of the photo or video to display. Omit it to select the album\'s first item.',
        ),
      }),
      annotations: { readOnlyHint: true },
      _meta: {
        ui: {
          resourceUri: MEDIA_APP_URI,
        },
      },
    },
    withToolErrorHandling(async ({ gallery, album, select }) => {
      const resolvedAlbum = await resolveAlbumName(gallery, album)
      const result = await getAlbum(gallery, resolvedAlbum)
      const items = result.album.items

      if (items.length === 0) {
        throw new ReferenceError(`Album ${resolvedAlbum} in gallery ${gallery} does not contain any media items`)
      }

      const selectedIndex = select
        ? items.findIndex(item => getPrimaryFilename(item.filename) === select)
        : 0
      const normalizedSelectedIndex = selectedIndex >= 0 ? selectedIndex : -1
      const selectedItem = normalizedSelectedIndex >= 0
        ? items[normalizedSelectedIndex]
        : null

      if (!selectedItem) {
        throw new ReferenceError(`No media item named ${select} was found in album ${resolvedAlbum} for gallery ${gallery}`)
      }

      const selectedFilename = getPrimaryFilename(selectedItem.filename)
      const previousItem = normalizedSelectedIndex > 0
        ? items[normalizedSelectedIndex - 1]
        : null
      const nextItem = normalizedSelectedIndex < items.length - 1
        ? items[normalizedSelectedIndex + 1]
        : null

      return {
        content: buildMediaToolContentBlocks(
          gallery,
          resolvedAlbum,
          selectedItem,
          [
            `Selected media item ${selectedFilename} from album ${resolvedAlbum} in gallery ${gallery}.`,
            'Inline preview uses the largest available display image that stays within the MCP payload budget.',
            'Use the linked album page or interactive app to open the selected item locally.',
            'Interactive media view is available in MCP clients that support Apps.',
          ].join('\n'),
        ),
        structured: {
          gallery,
          album: resolvedAlbum,
          requestedAlbum: album,
          select: selectedFilename,
          selectedIndex: normalizedSelectedIndex,
          totalItems: items.length,
          item: buildMediaItemPayload(selectedItem),
          previous: previousItem ? buildMediaNavigationItemPayload(previousItem) : null,
          next: nextItem ? buildMediaNavigationItemPayload(nextItem) : null,
          items: items.map(item => buildMediaNavigationItemPayload(item)),
        },
      }
    }),
  )

  registerAppResource(
    appResourceServer,
    'history-media-viewer',
    MEDIA_APP_URI,
    {
      title: 'History Media Viewer',
      description: 'Interactive MCP App for browsing a selected photo or video from the history archive.',
    },
    async () => ({
      contents: [{
        uri: MEDIA_APP_URI,
        mimeType: RESOURCE_MIME_TYPE,
        text: buildMediaAppHtml(),
        _meta: {
          ui: {
            csp: {
              resourceDomains: [appOrigin],
            },
          },
        },
      }],
    }),
  )

  server.registerTool(
    'get_on_this_day_story',
    {
      title: 'Get memories On This Day Story',
      description:
        'Return on-this-day memory details, including dates, albums, captions, locations, people, and configured gallery keywords.',
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
        'Return appearance counts, date range, related album keywords, the gallery keyword inventory, and a graphical interface link for a person.',
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
      description: 'Compact paginated album inventory for a specific photo gallery. Use ?page=N&limit=M to read additional pages.',
      mimeType: 'text/plain',
    },
    async (uri, variables) => {
      const gallery = getGalleryFromTemplate(uri, variables.gallery, 0)
      const page = parsePositiveIntSearchParam(uri, 'page', 1, 1000)
      const limit = parsePositiveIntSearchParam(uri, 'limit', 25, 50)

      return ({
      contents: [{
        uri: uri.href,
        text: await buildGalleryInventoryText(gallery, { page, limit }),
      }],
      })
    },
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
            'Call search_story_moments first when you do not already know the exact album or filename.',
            'Call get_album_story, get_album_media, get_on_this_day_story, or get_person_story when relevant to the request.',
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
