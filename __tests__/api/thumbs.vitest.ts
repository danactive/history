// @vitest-environment node

import { describe, expect, test } from 'vitest'
import { NextRequest } from 'next/server'

import { GET, POST } from '../../app/api/admin/thumbs/route'

describe('Thumbnail framing API', () => {
  test('rejects incomplete save requests', async () => {
    const response = await POST(new NextRequest('http://test', {
      method: 'POST',
      body: JSON.stringify({}),
    }))

    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body.error.message).toContain('source_folder')
  })

  test('denies GET requests', async () => {
    const response = await GET(new NextRequest('http://test', { method: 'GET' }))

    expect(response.status).toBe(405)
    const body = await response.json()
    expect(body.error.message).toContain('Not Allowed')
  })
})
