import type { Gallery, XmlItem } from '../types/common'
import { getPrimaryFilename } from '../utils'

export const privateMediaSchemaVersion = 1 as const
export const privateMediaVariants = ['photo', 'thumb'] as const

export type PrivateMediaVariant = (typeof privateMediaVariants)[number]

export type PrivateMediaIdentity = {
  gallery: Gallery;
  filename: string;
  variant: PrivateMediaVariant;
}

export type PrivateMediaEntry = PrivateMediaIdentity & {
  id: string;
  objectKey: string;
  version: string;
  contentType: 'image/jpeg';
  bytes: number;
  sha256: string;
}

export type PrivateMediaManifest = {
  schemaVersion: typeof privateMediaSchemaVersion;
  generatedAt: string;
  entries: PrivateMediaEntry[];
}

export const emptyPrivateMediaManifest: PrivateMediaManifest = {
  schemaVersion: privateMediaSchemaVersion,
  generatedAt: '',
  entries: [],
}

function isPrivateMediaVariant(value: unknown): value is PrivateMediaVariant {
  return typeof value === 'string' && privateMediaVariants.includes(value as PrivateMediaVariant)
}

function isOpaqueMediaId(value: unknown): value is string {
  return typeof value === 'string' && /^[A-Za-z0-9_-]{16,128}$/.test(value)
}

function isSha256(value: unknown): value is string {
  return typeof value === 'string' && /^[a-f0-9]{64}$/.test(value)
}

export function getCanonicalMediaFilename(filename: XmlItem['filename']): string {
  const primary = getPrimaryFilename(filename)
  if (primary === '') throw new Error('A private media identity requires a filename')
  return primary
}

export function createPrivateMediaIdentity(
  gallery: Gallery,
  filename: XmlItem['filename'],
  variant: PrivateMediaVariant,
): PrivateMediaIdentity {
  if (!isPrivateMediaVariant(variant)) throw new Error(`Unsupported private media variant: ${variant}`)

  return { gallery, filename: getCanonicalMediaFilename(filename), variant }
}

export function privateMediaIdentityKey(identity: PrivateMediaIdentity): string {
  return `${identity.gallery}\u0000${identity.filename}\u0000${identity.variant}`
}

export function privateMediaObjectKey(id: string, version: string): string {
  if (!isOpaqueMediaId(id)) throw new Error('Private media id must be opaque')
  if (!isSha256(version)) throw new Error('Private media version must be a SHA-256 hex digest')
  return `media/${id}/${version}.jpg`
}

export function createPrivateMediaEntry(
  identity: PrivateMediaIdentity,
  input: Pick<PrivateMediaEntry, 'id' | 'version' | 'bytes' | 'sha256'>,
): PrivateMediaEntry {
  if (!Number.isSafeInteger(input.bytes) || input.bytes < 0) {
    throw new Error('Private media byte length must be a non-negative safe integer')
  }
  if (!isSha256(input.sha256) || input.sha256 !== input.version) {
    throw new Error('Private media version must match its SHA-256 digest')
  }

  return {
    ...identity,
    id: input.id,
    objectKey: privateMediaObjectKey(input.id, input.version),
    version: input.version,
    contentType: 'image/jpeg',
    bytes: input.bytes,
    sha256: input.sha256,
  }
}

export function parsePrivateMediaManifest(value: unknown): PrivateMediaManifest {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error('Private media manifest must be an object')
  }

  const candidate = value as Partial<PrivateMediaManifest>
  if (candidate.schemaVersion !== privateMediaSchemaVersion) {
    throw new Error(`Unsupported private media manifest schema version: ${candidate.schemaVersion}`)
  }
  if (typeof candidate.generatedAt !== 'string' || !Array.isArray(candidate.entries)) {
    throw new Error('Private media manifest is missing generatedAt or entries')
  }

  const keys = new Set<string>()
  const ids = new Set<string>()
  const entries = candidate.entries.map((entry): PrivateMediaEntry => {
    if (typeof entry !== 'object' || entry === null) throw new Error('Private media manifest entry must be an object')
    const parsed = entry as Partial<PrivateMediaEntry>
    if (typeof parsed.gallery !== 'string' || typeof parsed.filename !== 'string' || !isPrivateMediaVariant(parsed.variant)) {
      throw new Error('Private media manifest entry has an invalid identity')
    }
    const bytes = parsed.bytes
    if (!isOpaqueMediaId(parsed.id) || !isSha256(parsed.version) || !isSha256(parsed.sha256)
      || parsed.version !== parsed.sha256 || parsed.contentType !== 'image/jpeg'
      || typeof bytes !== 'number' || !Number.isSafeInteger(bytes) || bytes < 0) {
      throw new Error('Private media manifest entry has invalid media metadata')
    }

    const identity: PrivateMediaIdentity = {
      gallery: parsed.gallery as Gallery,
      filename: parsed.filename,
      variant: parsed.variant,
    }
    const expectedObjectKey = privateMediaObjectKey(parsed.id, parsed.version)
    if (parsed.objectKey !== expectedObjectKey) {
      throw new Error('Private media manifest entry object key does not match its id and version')
    }

    const key = privateMediaIdentityKey(identity)
    if (keys.has(key)) throw new Error(`Duplicate private media identity: ${key}`)
    if (ids.has(parsed.id)) throw new Error(`Duplicate private media id: ${parsed.id}`)
    keys.add(key)
    ids.add(parsed.id)

    return {
      ...identity,
      id: parsed.id,
      objectKey: parsed.objectKey,
      version: parsed.version,
      contentType: parsed.contentType,
      bytes,
      sha256: parsed.sha256,
    }
  })

  return {
    schemaVersion: privateMediaSchemaVersion,
    generatedAt: candidate.generatedAt,
    entries,
  }
}

export function findPrivateMediaEntry(manifest: PrivateMediaManifest, identity: PrivateMediaIdentity) {
  const identityKey = privateMediaIdentityKey(identity)
  return manifest.entries.find(entry => privateMediaIdentityKey(entry) === identityKey) ?? null
}

export function findPrivateMediaEntryById(manifest: PrivateMediaManifest, id: string) {
  return manifest.entries.find(entry => entry.id === id) ?? null
}
