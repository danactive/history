/**
 * @jest-environment node
 */

import { testApiHandler } from 'next-test-api-route-handler'

import { GET, POST } from '../../app/api/galleries/route'
import config from '../../src/models/config'

describe('Galleries endpoint', () => {
  describe('Expect result', () => {
    test('* GET has galleries', async () => {
      await testApiHandler({
        appHandler: { GET },
        test: async ({ fetch }) => {
          const response = await fetch({ method: 'GET' })
          const result = await response.json()

          expect(response.status).toBe(200)

          expect(result.galleries.length).toBeGreaterThan(0)
          expect(result.galleries.includes(config.defaultGallery)).toBeTruthy()
        },
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

          expect(result.galleries.length).toBe(0)
          expect(result.galleries.includes(config.defaultGallery)).toBeFalsy()
        },
      })
    })
  })
})
