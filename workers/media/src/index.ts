import manifestJson from '../../../src/generated/private-media-manifest.json'
import {
  findPrivateMediaEntryById,
  parsePrivateMediaManifest,
  type PrivateMediaManifest,
} from '../../../src/lib/private-media'

type R2ObjectBody = {
  body: ReadableStream;
  size: number;
  httpMetadata?: { contentType?: string };
}

export type MediaWorkerEnvironment = {
  HISTORY_MEDIA: {
    get: (key: string) => Promise<R2ObjectBody | null>;
  };
}

const manifest = parsePrivateMediaManifest(manifestJson)

function denied() {
  return new Response('Authentication required', {
    status: 401,
    headers: { 'Cache-Control': 'no-store' },
  })
}

function notFound() {
  return new Response('Not found', {
    status: 404,
    headers: { 'Cache-Control': 'no-store' },
  })
}

/**
 * Cloudflare Access must protect the only Worker route and workers.dev is
 * disabled in wrangler configuration. The assertion presence is a defensive
 * in-Worker check; Access is the authorization authority.
 */
export async function handleMediaRequest(
  request: Request,
  env: MediaWorkerEnvironment,
  activeManifest: PrivateMediaManifest = manifest,
) {
  if (!request.headers.get('Cf-Access-Jwt-Assertion')) return denied()

  const url = new URL(request.url)
  const segments = url.pathname.split('/').filter(Boolean)
  if (segments.length !== 2 || segments[0] !== 'media') return notFound()
  const id = segments[1]
  if (!id) return notFound()

  const entry = findPrivateMediaEntryById(activeManifest, id)
  if (!entry || url.searchParams.get('v') !== entry.version) return notFound()

  const object = await env.HISTORY_MEDIA.get(entry.objectKey)
  if (!object) return notFound()
  return new Response(object.body, {
    headers: {
      'Content-Type': object.httpMetadata?.contentType ?? entry.contentType,
      'Content-Length': String(object.size),
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}

export default {
  fetch: handleMediaRequest,
}
