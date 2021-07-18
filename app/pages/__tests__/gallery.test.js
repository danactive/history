import { testApiHandler } from 'next-test-api-route-handler'

import config from '../../../config.json'
import handler from '../api/galleries/[gallery]'

describe('Gallery endpoint', () => {
  describe('Expect result', () => {
    test('* GET has gallery', async () => {
      const test = async ({ fetch }) => {
        const response = await fetch({ method: 'GET' })
        const result = await response.json()

        expect(response.status).toBe(200)

        expect(result.gallery.name).toBe(config.defaultGallery)
      }
      const params = { gallery: config.defaultGallery }
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

        expect(result.gallery.length).toBe(0)
        expect(result.gallery.includes(config.defaultGallery)).toBeFalsy()
      }
      await testApiHandler({ handler, test })
    })
  })
})
