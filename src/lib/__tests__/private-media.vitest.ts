import { describe, expect, test } from 'vitest'

import {
  createPrivateMediaEntry,
  createPrivateMediaIdentity,
  findPrivateMediaEntry,
  parsePrivateMediaManifest,
  privateMediaIdentityKey,
  privateMediaSchemaVersion,
} from '../private-media'
import { resolveDisplayMediaPath } from '../media-resolver'

const digest = 'a'.repeat(64)
const id = '8a2RgRY6H1QvlIlB3x9O4Q'
const identity = createPrivateMediaIdentity('demo', '2024-07-12-lake.heic', 'photo')
const entry = createPrivateMediaEntry(identity, { id, version: digest, sha256: digest, bytes: 42 })
const manifest = { schemaVersion: privateMediaSchemaVersion, generatedAt: '2026-09-06T00:00:00.000Z', entries: [entry] }

describe('private media manifest', () => {
  test('uses the XML filename as stable identity while versioning derivative content', () => {
    expect(privateMediaIdentityKey(identity)).toBe('demo\u00002024-07-12-lake.heic\u0000photo')
    expect(entry.objectKey).toBe(`media/${id}/${digest}.jpg`)
    expect(findPrivateMediaEntry(parsePrivateMediaManifest(manifest), identity)).toEqual(entry)
  })

  test('rejects a manifest object key that exposes the source filename', () => {
    const unsafe = { ...entry, objectKey: 'media/demo/2024-07-12-lake.jpg' }
    expect(() => parsePrivateMediaManifest({ ...manifest, entries: [unsafe] })).toThrow('object key does not match')
  })
})

describe('display media resolver', () => {
  test('keeps local media paths when deployment mode is not private', () => {
    expect(resolveDisplayMediaPath('2024-07-12-lake.heic', 'demo', 'photo', { env: {} })).toBe(
      '/galleries/demo/media/photos/2024/2024-07-12-lake.jpg',
    )
  })

  test('uses a same-origin opaque URL only in private deployment mode', () => {
    expect(resolveDisplayMediaPath('2024-07-12-lake.heic', 'demo', 'photo', {
      env: { HISTORY_MEDIA_MODE: 'private' },
      manifest: parsePrivateMediaManifest(manifest),
    })).toBe(`/media/${id}?v=${digest}`)
  })

  test('never silently falls back to a local public path in private mode', () => {
    expect(() => resolveDisplayMediaPath('2024-07-13-missing.jpg', 'demo', 'photo', {
      env: { HISTORY_MEDIA_MODE: 'private' },
      manifest: parsePrivateMediaManifest(manifest),
    })).toThrow('Private media manifest has no photo entry')
  })
})
