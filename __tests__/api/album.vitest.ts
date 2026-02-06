// @vitest-environment node

import { describe, expect, test } from 'vitest'

import { NextRequest } from 'next/server'
import { GET, POST } from '../../app/api/galleries/[gallery]/albums/[album]/route'
import config from '../../src/models/config'

describe('Album endpoint', () => {
  describe('Expect result', () => {
    test('* GET has album', async () => {
      const response = await GET(
        new NextRequest('http://test'),
        { params: Promise.resolve({ gallery: config.defaultGallery, album: config.defaultAlbum }) },
      )
      const result = await response.json()

      expect(response.status).toBe(200)

      expect(result.album.items.length).toBeGreaterThan(0)
      expect(result.album.items[0].filename).toBe('2001-03-21-01.jpg')
    })
  })

  describe('Expect error', () => {
    test('* POST verb is denied', async () => {
      const response = await POST(new NextRequest('http://test', { method: 'POST' }))
      const result = await response.json()

      expect(response.status).toBe(405)
      expect(result.error.message.toLowerCase()).toContain('not allowed')

      expect(result.album.length).toBe(0)
    })
  })
})
