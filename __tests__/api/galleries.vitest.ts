// @vitest-environment node

import { describe, expect, test } from 'vitest'

import { GET, POST } from '../../app/api/galleries/route'
import config from '../../src/models/config'

describe('Galleries endpoint', () => {
  describe('Expect result', () => {
    test('* GET has galleries', async () => {
      const response = await GET()
      const result = await response.json()

      expect(response.status).toBe(200)

      expect(result.galleries.length).toBeGreaterThan(0)
      expect(result.galleries.includes(config.defaultGallery)).toBeTruthy()
    })
  })

  describe('Expect error', () => {
    test('* POST verb is denied', async () => {
      const response = await POST(new Request('http://test', { method: 'POST' }))
      const result = await response.json()

      expect(response.status).toBe(405)
      expect(result.error.message.toLowerCase()).toContain('not allowed')

      expect(result.galleries.length).toBe(0)
      expect(result.galleries.includes(config.defaultGallery)).toBeFalsy()
    })
  })
})
