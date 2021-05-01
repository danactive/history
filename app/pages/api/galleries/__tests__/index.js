/* eslint-disable no-underscore-dangle */
import { createMocks } from 'node-mocks-http'

import handleEndpoints from '..'

describe('Galleries API', () => {
  describe('Expect result', () => {
    test('* GET has galleries', async () => {
      const { req, res } = createMocks({
        method: 'GET',
      })

      await handleEndpoints(req, res)
      expect(res._getStatusCode()).toBe(200)

      const result = JSON.parse(res._getData())
      expect(result.galleries.length).toBeGreaterThan(0)
      expect(result.galleries.includes('demo')).toBeTruthy()
    })
  })

  describe('Expect error', () => {
    test('* POST verb is denied', async () => {
      const { req, res } = createMocks({
        method: 'POST',
      })

      await handleEndpoints(req, res)
      expect(res._getStatusCode()).toBe(405)

      const result = JSON.parse(res._getData())
      expect(result.galleries.length).toBe(0)
      expect(result.galleries.includes('demo')).toBeFalsy()
    })
  })
})
