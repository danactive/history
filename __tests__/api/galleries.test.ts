/**
 * @jest-environment node
 */

import { testApiHandler } from 'next-test-api-route-handler'

import pagesHandler from '../../pages/api/galleries'

describe('Galleries endpoint', () => {
  describe('Expect result', () => {
    test('* GET has galleries', async () => {
      await testApiHandler({
        pagesHandler,
        test: async ({ fetch }) => {
          const response = await fetch({ method: 'GET' })
          const result = await response.json()

          expect(response.status).toBe(200)

          expect(result.galleries.length).toBeGreaterThan(0)
          expect(result.galleries.includes('demo')).toBeTruthy()
        },
      })
    })
  })

  describe('Expect error', () => {
    test('* POST verb is denied', async () => {
      await testApiHandler({
        pagesHandler,
        test: async ({ fetch }) => {
          const response = await fetch({ method: 'POST' })
          const result = await response.json()

          expect(response.status).toBe(405)
          expect(result.error.message.toLowerCase()).toContain('not allowed')

          expect(result.galleries.length).toBe(0)
          expect(result.galleries.includes('demo')).toBeFalsy()
        },
      })
    })
  })
})
