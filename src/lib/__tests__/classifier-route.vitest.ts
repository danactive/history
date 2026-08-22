import { afterEach, describe, expect, test, vi } from 'vitest'

import { POST } from '../../../app/api/admin/classify/route'

const fixturePath = '/test/fixtures/classifier/Long-tailed_fiscal_Lanius_cabanisi.jpg'

function classifierRequest() {
  return new Request('http://localhost/api/admin/classify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path: fixturePath }),
  })
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('admin classifier route failures', () => {
  test('returns an actionable 503 when the Python service is stopped', async () => {
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
