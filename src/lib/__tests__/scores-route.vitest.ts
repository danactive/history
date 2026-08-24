import { afterEach, describe, expect, test, vi } from 'vitest'

import { POST } from '../../../app/api/admin/scores/route'

const fixturePath = '/test/fixtures/classifier/Long-tailed_fiscal_Lanius_cabanisi.jpg'
const validScore = {
  overall_score: 70.8,
  technical_score: 7.1,
  composition_score: 6.4,
  aesthetic_score: 6.8,
  sharpness_score: 6.1,
  exposure_score: 8.4,
  resolution_score: 10,
  image_width: 4032,
  image_height: 3024,
  notes: ['No obvious technical limitation was detected.'],
}

function scoreRequest(body: unknown = { path: fixturePath }) {
  return new Request('http://localhost/api/admin/scores', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('admin scores route', () => {
  test('forwards a validated Python score response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json(validScore)))

    const response = await POST(scoreRequest())

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual(validScore)
  })

  test('rejects a malformed request before reading a file', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    const response = await POST(scoreRequest({ path: '' }))

    expect(response.status).toBe(400)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  test('returns an actionable 503 when the Python service is stopped', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(Object.assign(
      new TypeError('fetch failed'),
      { cause: { code: 'ECONNREFUSED' } },
    )))

    const response = await POST(scoreRequest())

    expect(response.status).toBe(503)
    await expect(response.json()).resolves.toEqual({
      code: 'classifier_unavailable',
      error: 'The photo classifier is not running. Start the Python AI service with make ai-api, then try again.',
    })
  })

  test('rejects an invalid successful Python response as an outdated service', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json({ overall_score: 70.8 })))

    const response = await POST(scoreRequest())

    expect(response.status).toBe(502)
    await expect(response.json()).resolves.toEqual({
      code: 'classifier_outdated',
      error: 'The Python AI service is out of date. Stop it, run make build-ai-api, then start it with make ai-api.',
    })
  })
})
