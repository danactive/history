// @vitest-environment node

import { describe, expect, test } from 'vitest'

import { NextRequest } from 'next/server'
import { GET, POST } from '../../app/api/galleries/[gallery]/albums/route'
import { type GalleryAlbumsBody } from '../../src/lib/albums'
import config from '../../src/models/config'

describe('Albums endpoint', () => {
  describe('Expect result', () => {
    test('* GET has albums', async () => {
      const response = await GET(
        new NextRequest('http://test'),
        { params: Promise.resolve({ gallery: config.defaultGallery }) },
      )
      const result: GalleryAlbumsBody = await response.json()

      expect(response.status).toBe(200)

      expect(result.demo.albums.length).toBeGreaterThan(0)
      expect(result.demo.albums[0].name).toBe(config.defaultAlbum)
    })
  })

  describe('Expect error', () => {
    test('* POST verb is denied', async () => {
      const response = await POST(new NextRequest('http://test', { method: 'POST' }))
      const result = await response.json()

      expect(response.status).toBe(405)
      expect(result.error.message.toLowerCase()).toContain('not allowed')

      expect(result.albums.length).toBe(0)
    })
  })
})
