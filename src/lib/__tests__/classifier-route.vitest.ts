import { afterEach, describe, expect, test, vi } from 'vitest'
import fs from 'node:fs/promises'

import { POST } from '../../../app/api/admin/classify/route'

const fixturePath = '/galleries/demo/media/originals/2025/example.jpg'

function classifierRequest(body: unknown = { path: fixturePath }) {
  return new Request('http://localhost/api/admin/classify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('admin classifier route failures', () => {
  test('rejects a malformed request before reading a file', async () => {
    const fetchMock = vi.fn()
    const readFileSpy = vi.spyOn(fs, 'readFile').mockResolvedValue(Buffer.from('image'))
    vi.stubGlobal('fetch', fetchMock)

    const response = await POST(classifierRequest(null))

    expect(response.status).toBe(400)
    expect(readFileSpy).not.toHaveBeenCalled()
    expect(fetchMock).not.toHaveBeenCalled()
    await expect(response.json()).resolves.toEqual({
      code: 'request_error',
      error: 'Invalid input: expected object, received null',
    })
  })

  test('returns an actionable 503 when the Python service is stopped', async () => {
    vi.spyOn(fs, 'readFile').mockResolvedValue(Buffer.from('image'))
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(Object.assign(
      new TypeError('fetch failed'),
      { cause: { code: 'ECONNREFUSED' } },
    )))

    const response = await POST(classifierRequest())

    expect(response.status).toBe(503)
    await expect(response.json()).resolves.toEqual({
      code: 'classifier_unavailable',
      error: 'The photo classifier is not running. Start the Python AI service with make ai-api, then try again.',
    })
  })

  test('recognizes an older Python image without the combined route', async () => {
    vi.spyOn(fs, 'readFile').mockResolvedValue(Buffer.from('image'))
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json(
      { detail: 'Not Found' },
      { status: 404 },
    )))

    const response = await POST(classifierRequest())

    expect(response.status).toBe(503)
    await expect(response.json()).resolves.toEqual({
      code: 'classifier_outdated',
      error: 'The Python AI service is out of date. Stop it, run make build-ai-api, then start it with make ai-api.',
    })
  })
})
