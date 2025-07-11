/**
 * @jest-environment node
 */

import { testApiHandler } from 'next-test-api-route-handler'

import { GET, POST } from '../../app/api/galleries/[gallery]/albums/route'
import { type GalleryAlbumsBody } from '../../src/lib/albums'
import config from '../../src/models/config'

describe('Albums endpoint', () => {
  describe('Expect result', () => {
    test('* GET has albums', async () => {
      await testApiHandler({
        appHandler: { GET },
        test: async ({ fetch }) => {
          const response = await fetch({ method: 'GET' })
          const result: GalleryAlbumsBody = await response.json()

          expect(response.status).toBe(200)

          expect(result.demo.albums.length).toBeGreaterThan(0)
          expect(result.demo.albums[0].name).toBe(config.defaultAlbum)
        },
        params: { gallery: config.defaultGallery },
      })
    })
  })

  describe('Expect error', () => {
    test('* POST verb is denied', async () => {
      await testApiHandler({
        appHandler: { POST },
        test: async ({ fetch }) => {
          const response = await fetch({ method: 'POST' })
          const result = await response.json()

          expect(response.status).toBe(405)
          expect(result.error.message.toLowerCase()).toContain('not allowed')

          expect(result.albums.length).toBe(0)
        },
      })
    })
  })
})
