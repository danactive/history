import { describe, expect, test } from 'vitest'

import { handleMediaRequest } from './index'
import {
  createPrivateMediaEntry,
  createPrivateMediaIdentity,
  privateMediaSchemaVersion,
} from '../../../src/lib/private-media'

const environment = {
  HISTORY_MEDIA: {
    get: async () => ({
      body: new ReadableStream({ start(controller) { controller.close() } }),
      size: 0,
      httpMetadata: { contentType: 'image/jpeg' },
    }),
  },
}

describe('private media Worker', () => {
  test('rejects a request without the Cloudflare Access assertion before R2 lookup', async () => {
    const get = vi.fn(environment.HISTORY_MEDIA.get)
    const response = await handleMediaRequest(new Request('https://history.example/media/not-a-real-id?v=x'), {
      HISTORY_MEDIA: { get },
    })

    expect(response.status).toBe(401)
    expect(get).not.toHaveBeenCalled()
  })

  test('rejects an unknown media identifier before R2 lookup', async () => {
    const get = vi.fn(environment.HISTORY_MEDIA.get)
    const response = await handleMediaRequest(new Request('https://history.example/media/not-a-real-id?v=x', {
      headers: { 'Cf-Access-Jwt-Assertion': 'Access-validates-this-before-the-Worker' },
    }), {
      HISTORY_MEDIA: { get },
    })

    expect(response.status).toBe(404)
    expect(get).not.toHaveBeenCalled()
  })

  test('retrieves only the manifest-selected R2 object for an Access-authenticated request', async () => {
    const version = 'a'.repeat(64)
    const entry = createPrivateMediaEntry(
      createPrivateMediaIdentity('demo', '2024-07-12-lake.heic', 'photo'),
      { id: '8a2RgRY6H1QvlIlB3x9O4Q', version, sha256: version, bytes: 3 },
    )
    const get = vi.fn(environment.HISTORY_MEDIA.get)
    const response = await handleMediaRequest(new Request(`https://history.example/media/${entry.id}?v=${version}`, {
      headers: { 'Cf-Access-Jwt-Assertion': 'Access-validates-this-before-the-Worker' },
    }), {
      HISTORY_MEDIA: { get },
    }, {
      schemaVersion: privateMediaSchemaVersion,
      generatedAt: '2026-09-06T00:00:00.000Z',
      entries: [entry],
    })

    expect(response.status).toBe(200)
    expect(response.headers.get('Content-Type')).toBe('image/jpeg')
    expect(response.headers.get('Cache-Control')).toBe('private, no-store')
    expect(get).toHaveBeenCalledWith(entry.objectKey)
  })
})
