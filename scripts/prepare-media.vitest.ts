import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, test, vi } from 'vitest'

import {
  findDuplicateR2MediaObjects,
  loadPrepareMediaEnvironment,
  R2ObjectStore,
} from './prepare-media'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('R2ObjectStore', () => {
  test('adds safe R2 context and the network cause to fetch failures', async () => {
    const networkCause = Object.assign(new Error('getaddrinfo ENOTFOUND'), { code: 'ENOTFOUND' })
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('fetch failed', { cause: networkCause })))
    const store = new R2ObjectStore({
      accountId: 'account-id',
      accessKeyId: 'access-key-id',
      secretAccessKey: 'must-not-appear',
      bucket: 'history-private-media',
    })

    let error: Error | null = null
    try {
      await store.head('media/8a2RgRY6H1QvlIlB3x9O4Q/version.jpg')
    } catch (value) {
      error = value as Error
    }

    expect(error).toBeInstanceOf(Error)
    expect(error?.message).toContain('R2 HEAD media/8a2RgRY6H1QvlIlB3x9O4Q/version.jpg could not reach https://account-id.r2.cloudflarestorage.com')
    expect(error?.message).toContain('fetch failed; cause: getaddrinfo ENOTFOUND [ENOTFOUND]')
    expect(error?.message).not.toContain('must-not-appear')
  })

  test('loads .env defaults while retaining an inherited shell value', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'history-private-media-env-'))
    const environmentPath = join(directory, '.env')
    const keys = ['HISTORY_R2_ACCOUNT_ID', 'HISTORY_R2_BUCKET'] as const
    const original = new Map(keys.map(key => [key, process.env[key]]))
    try {
      delete process.env.HISTORY_R2_ACCOUNT_ID
      process.env.HISTORY_R2_BUCKET = 'shell-bucket'
      await writeFile(environmentPath, 'HISTORY_R2_ACCOUNT_ID=account-from-file\nHISTORY_R2_BUCKET=file-bucket\n')

      expect(loadPrepareMediaEnvironment(process.env, environmentPath)).toBe(true)
      expect(process.env.HISTORY_R2_ACCOUNT_ID).toBe('account-from-file')
      expect(process.env.HISTORY_R2_BUCKET).toBe('shell-bucket')
    } finally {
      await rm(directory, { force: true, recursive: true })
      for (const [key, value] of original) {
        if (value === undefined) delete process.env[key]
        else process.env[key] = value
      }
    }
  })

  test('lists every R2 page and finds duplicated content stored under different IDs', async () => {
    const sha256 = 'a'.repeat(64)
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(`
        <ListBucketResult>
          <Contents><Key>media/8a2RgRY6H1QvlIlB3x9O4Q/${sha256}.jpg</Key><Size>3</Size></Contents>
          <IsTruncated>true</IsTruncated><NextContinuationToken>next-page</NextContinuationToken>
        </ListBucketResult>
      `))
      .mockResolvedValueOnce(new Response(`
        <ListBucketResult>
          <Contents><Key>media/4X2ZqW9KmN3BtV5CsL7ArE1P/${sha256}.jpg</Key><Size>3</Size></Contents>
          <IsTruncated>false</IsTruncated>
        </ListBucketResult>
      `))
    vi.stubGlobal('fetch', fetchMock)
    const store = new R2ObjectStore({
      accountId: 'account-id',
      accessKeyId: 'access-key-id',
      secretAccessKey: 'must-not-appear',
      bucket: 'history-private-media',
    })

    const objects = await store.listMediaObjects()
    const report = findDuplicateR2MediaObjects(objects)

    expect(objects).toHaveLength(2)
    expect(report.duplicateObjectCount).toBe(1)
    expect(report.duplicateBytes).toBe(3)
    expect(report.duplicateGroups[0]?.keys).toHaveLength(2)
    expect((fetchMock.mock.calls[0]?.[0] as URL).search).toBe('?list-type=2&prefix=media%2F')
    expect((fetchMock.mock.calls[1]?.[0] as URL).search).toBe('?continuation-token=next-page&list-type=2&prefix=media%2F')
  })
})
