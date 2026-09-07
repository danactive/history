import manifestJson from '../generated/private-media-manifest.json'
import type { Gallery, XmlItem } from '../types/common'
import { photoPath, thumbPath } from './paths'
import {
  createPrivateMediaIdentity,
  findPrivateMediaEntry,
  parsePrivateMediaManifest,
  type PrivateMediaManifest,
  type PrivateMediaVariant,
} from './private-media'

const privateMediaManifest = parsePrivateMediaManifest(manifestJson)

export type MediaDeliveryMode = 'local' | 'private'
type MediaEnvironment = Readonly<Record<string, string | undefined>>

export function getMediaDeliveryMode(env: MediaEnvironment = process.env): MediaDeliveryMode {
  return env.HISTORY_MEDIA_MODE === 'private' ? 'private' : 'local'
}

function localDisplayPath(filename: XmlItem['filename'], gallery: Gallery, variant: PrivateMediaVariant) {
  return variant === 'photo' ? photoPath(filename, gallery) : thumbPath(filename, gallery)
}

function mediaPathPrefix(env: MediaEnvironment): string {
  const configured = env.HISTORY_MEDIA_PATH_PREFIX ?? '/media'
  if (!configured.startsWith('/') || configured.startsWith('//') || configured.includes('?') || configured.includes('#')) {
    throw new Error('HISTORY_MEDIA_PATH_PREFIX must be a same-origin path prefix')
  }
  return configured.replace(/\/$/, '')
}

export function privateMediaUrl(entry: { id: string; version: string }, env: MediaEnvironment = process.env): string {
  const url = new URL(`${mediaPathPrefix(env)}/${encodeURIComponent(entry.id)}`, 'https://history.invalid')
  url.searchParams.set('v', entry.version)
  return `${url.pathname}${url.search}`
}

export function resolveDisplayMediaPath(
  filename: XmlItem['filename'],
  gallery: Gallery,
  variant: PrivateMediaVariant,
  options: { env?: MediaEnvironment; manifest?: PrivateMediaManifest } = {},
): string {
  const env = options.env ?? process.env
  if (getMediaDeliveryMode(env) === 'local') return localDisplayPath(filename, gallery, variant)

  const identity = createPrivateMediaIdentity(gallery, filename, variant)
  const entry = findPrivateMediaEntry(options.manifest ?? privateMediaManifest, identity)
  if (!entry) {
    throw new Error(`Private media manifest has no ${variant} entry for ${gallery}/${identity.filename}`)
  }
  return privateMediaUrl(entry, env)
}

export function resolvePhotoPath(filename: XmlItem['filename'], gallery: Gallery, options?: Parameters<typeof resolveDisplayMediaPath>[3]) {
  return resolveDisplayMediaPath(filename, gallery, 'photo', options)
}

export function resolveThumbPath(filename: XmlItem['filename'], gallery: Gallery, options?: Parameters<typeof resolveDisplayMediaPath>[3]) {
  return resolveDisplayMediaPath(filename, gallery, 'thumb', options)
}
