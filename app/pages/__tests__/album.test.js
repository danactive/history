import { testApiHandler } from 'next-test-api-route-handler'

import config from '../../../config.json'
import handler from '../api/galleries/[gallery]/albums/[album]'

describe('Album endpoint', () => {
  describe('Expect result', () => {
    test('* GET has album', async () => {
      const test = async ({ fetch }) => {
        const response = await fetch({ method: 'GET' })
        const result = await response.json()

        expect(response.status).toBe(200)

        expect(result.album.items.length).toBeGreaterThan(0)
        expect(result.album.items[0].filename).toBe('2001-03-21-01.jpg')
      }
      const params = { gallery: config.defaultGallery, album: config.defaultAlbum }
      await testApiHandler({ handler, test, params })
    })
  })

  describe('Expect error', () => {
    test('* POST verb is denied', async () => {
      const test = async ({ fetch }) => {
        const response = await fetch({ method: 'POST' })
        const result = await response.json()

        expect(response.status).toBe(405)
        expect(result.error.message.toLowerCase()).toContain('not allowed')

        expect(result.album.length).toBe(0)
      }
      await testApiHandler({ handler, test })
    })
  })
})
