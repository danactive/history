import { createHash } from 'node:crypto'
import { describe, expect, test } from 'vitest'

import {
  historyMediaStorageBudgetBytes,
  preparePrivateMedia,
  type PreparedPrivateMediaAsset,
  type PrivateMediaObjectMetadata,
} from '../private-media-preparation'
import {
  createPrivateMediaEntry,
  createPrivateMediaIdentity,
  privateMediaSchemaVersion,
} from '../private-media'

const digest = createHash('sha256').update(new Uint8Array([1, 2, 3])).digest('hex')
const asset: PreparedPrivateMediaAsset = {
  gallery: 'demo',
  filename: '2024-07-12-lake.heic',
  variant: 'photo',
  bytes: 3,
  content: new Uint8Array([1, 2, 3]),
  sha256: digest,
}

function createStore() {
  const objects = new Map<string, PrivateMediaObjectMetadata>()
  let puts = 0
  return {
    store: {
      head: async (key: string) => objects.get(key) ?? null,
      put: async ({ key, content, sha256 }: { key: string; content: Uint8Array; sha256: string }) => {
        puts++
        objects.set(key, { bytes: content.byteLength, sha256 })
      },
    },
    get puts() { return puts },
  }
}

describe('private media preparation', () => {
  test('uploads and verifies changed derivatives before returning the manifest', async () => {
    const fake = createStore()
    const first = await preparePrivateMedia({
      assets: [asset],
      store: fake.store,
      idFactory: () => '8a2RgRY6H1QvlIlB3x9O4Q',
      now: new Date('2026-09-06T00:00:00.000Z'),
    })

    expect(first.uploadedObjectKeys).toEqual([`media/8a2RgRY6H1QvlIlB3x9O4Q/${digest}.jpg`])
    expect(first.manifest.entries[0]?.filename).toBe('2024-07-12-lake.heic')
    expect(fake.puts).toBe(1)

    const second = await preparePrivateMedia({
      assets: [asset],
      previousManifest: first.manifest,
      ledger: first.nextLedger,
      store: fake.store,
      idFactory: () => 'not-used-because-the-id-is-stable',
      now: new Date('2026-09-06T01:00:00.000Z'),
    })
    expect(second.uploadedObjectKeys).toEqual([])
    expect(second.manifest).toEqual(first.manifest)
    expect(fake.puts).toBe(1)
  })

  test('fails before remote mutation when the storage budget would be exceeded', async () => {
    const fake = createStore()
    const existing = createPrivateMediaEntry(
      createPrivateMediaIdentity('demo', '2024-07-11-existing.jpg', 'photo'),
      {
        id: '8a2RgRY6H1QvlIlB3x9O4Q',
        version: 'c'.repeat(64),
        sha256: 'c'.repeat(64),
        bytes: historyMediaStorageBudgetBytes,
      },
    )
    const previousManifest = {
      schemaVersion: privateMediaSchemaVersion,
      generatedAt: '2026-09-06T00:00:00.000Z',
      entries: [existing],
    }

    await expect(preparePrivateMedia({
      assets: [asset],
      previousManifest,
      store: fake.store,
      idFactory: () => '8a2RgRY6H1QvlIlB3x9O4Q',
    })).rejects.toThrow('storage budget exceeded')
    expect(fake.puts).toBe(0)
  })

  test('never accepts original-media variants', async () => {
    const fake = createStore()
    await expect(preparePrivateMedia({
      assets: [{ ...asset, variant: 'original' as never }],
      store: fake.store,
      idFactory: () => '8a2RgRY6H1QvlIlB3x9O4Q',
    })).rejects.toThrow('Unsupported private media variant')
  })
})
