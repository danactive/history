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
  type PrivateMediaManifest,
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
    const progress: string[] = []
    const first = await preparePrivateMedia({
      assets: [asset],
      store: fake.store,
      idFactory: () => '8a2RgRY6H1QvlIlB3x9O4Q',
      now: new Date('2026-09-06T00:00:00.000Z'),
      onProgress: event => progress.push(`${event.phase}:${event.current}/${event.total}`),
    })

    expect(first.uploadedObjectKeys).toEqual([`media/8a2RgRY6H1QvlIlB3x9O4Q/${digest}.jpg`])
    expect(first.manifest.entries[0]?.filename).toBe('2024-07-12-lake.heic')
    expect(fake.puts).toBe(1)
    expect(progress).toEqual(['checking:1/1', 'uploading:1/1', 'verifying:1/1'])

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

  test('resumes the same object keys after an interrupted initial preparation', async () => {
    const initialId = '8a2RgRY6H1QvlIlB3x9O4Q'
    const journal: { manifest: PrivateMediaManifest | null } = { manifest: null }
    const uploadedObjects = new Map<string, PrivateMediaObjectMetadata>()
    let verificationTimedOut = false
    const interruptedStore = {
      head: async (key: string) => {
        expect(journal.manifest).not.toBeNull()
        if (verificationTimedOut) throw new Error('R2 read timed out')
        return uploadedObjects.get(key) ?? null
      },
      put: async ({ key, content, sha256 }: { key: string; content: Uint8Array; sha256: string }) => {
        uploadedObjects.set(key, { bytes: content.byteLength, sha256 })
        verificationTimedOut = true
      },
    }

    await expect(preparePrivateMedia({
      assets: [asset],
      store: interruptedStore,
      idFactory: () => initialId,
      onPlan: manifest => { journal.manifest = manifest },
    })).rejects.toThrow('R2 read timed out')

    expect(journal.manifest?.entries[0]?.id).toBe(initialId)

    let putsAfterRetry = 0
    const resumed = await preparePrivateMedia({
      assets: [asset],
      resumeManifest: journal.manifest,
      store: {
        head: async key => uploadedObjects.get(key) ?? null,
        put: async () => { putsAfterRetry++ },
      },
      idFactory: () => 'this-id-must-not-be-used',
    })

    expect(resumed.manifest.entries[0]?.id).toBe(initialId)
    expect(resumed.uploadedObjectKeys).toEqual([])
    expect(putsAfterRetry).toBe(0)
  })

  test('does not persist a resume plan during a dry run', async () => {
    const fake = createStore()
    let plansWritten = 0

    await preparePrivateMedia({
      assets: [asset],
      store: fake.store,
      idFactory: () => '8a2RgRY6H1QvlIlB3x9O4Q',
      dryRun: true,
      onPlan: () => { plansWritten++ },
    })

    expect(plansWritten).toBe(0)
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
