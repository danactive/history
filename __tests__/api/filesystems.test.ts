/**
 * @jest-environment node
 */

import { testApiHandler } from 'next-test-api-route-handler'
import fs from 'node:fs'
import path from 'node:path'
import { promisify } from 'node:util'

import { GET, POST } from '../../app/api/admin/filesystems/route'
import utilsFactory from '../../src/lib/utils'
import type { Filesystem } from '../../src/lib/filesystems'

describe('Filesystem API', () => {
  describe('Expect result', () => {
    test('* GET root has favicon', async () => {
      await testApiHandler({
        appHandler: { GET },
        url: '/my-url?path=/',
        async test({ fetch }) {
          const res = await fetch({ method: 'GET' })
          expect(res.status).toBe(200)

          const result = await res.json()
          expect(Array.isArray(result.files)).toBe(true)
          expect(result.files.length).toBeGreaterThan(0)

          const filenames = result.files.map((f: Filesystem) => f.filename)
          expect(filenames.includes('favicon.ico')).toBe(true)
        },
      })
    })

    function matchPFile(expect: jest.Expect, file: Filesystem) {
      expect(file.filename).toEqual('P1160066.JPG')
      expect(file.ext).toEqual('JPG')
      expect(file.mediumType).toEqual('image')
      expect(file.name).toEqual('P1160066')
    }

    function matchJFile(expect: jest.Expect, file: Filesystem) {
      expect(file.filename).toEqual('jay.js')
      expect(file.ext).toEqual('js')
      expect(file.mediumType).toEqual('text')
      expect(file.name).toEqual('jay')
    }

    test('* GET fixtures has test files', async () => {
      const params = { path: 'test/fixtures/walkable' }
      await testApiHandler({
        appHandler: { GET },
        url: `/my-url?path=/${params.path}`,
        test: async ({ fetch }) => {
          const response = await fetch({ method: 'GET' })
          const result = await response.json()

          expect(response.status).toBe(200)

          matchPFile(expect, result.files[1])
          matchJFile(expect, result.files[0])
          expect(result.files.length).toEqual(3)
        },
      })
    })

    test('* GET fixtures has test files with space in path', async () => {
      const params = { path: 'test/fixtures/walk%20able' }
      await testApiHandler({
        appHandler: { GET },
        url: `/my-url?path=/${params.path}`,
        test: async ({ fetch }) => {
          const response = await fetch({ method: 'GET' })
          const result = await response.json()

          expect(response.status).toBe(200)

          matchPFile(expect, result.files[0])
          expect(result.files.length).toEqual(1)
        },
      })
    })

    test('* GET fixtures and verify all files exist in the filesystem', async () => {
      const params = { path: 'test/fixtures/walkable' }
      await testApiHandler({
        appHandler: { GET },
        url: `/my-url?path=/${params.path}`,
        test: async ({ fetch }) => {
          const response = await fetch({ method: 'GET' })
          const result = await response.json()

          expect(response.status).toBe(200)

          const utils = utilsFactory()
          const fsAccess = promisify(fs.access)

          const publicPath = utils.safePublicPath('/')

          await result.files.forEach(async (file: Filesystem) => {
            try {
              const filenamePath = path.join(publicPath, params.path, file.filename)
              const options = fs.constants.R_OK | fs.constants.W_OK // eslint-disable-line no-bitwise
              const existsError = await fsAccess(filenamePath, options)
              expect(existsError).toBeUndefined()
            } catch (error) {
              expect((error as Error).message).toBeUndefined()
            }
          })
        },
      })
    })
  })

  describe('Expect error', () => {
    test('* POST verb is denied', async () => {
      const params = { path: '/' }
      await testApiHandler({
        appHandler: { GET, POST },
        url: `/my-url?path=/${params.path}`,
        test: async ({ fetch }) => {
          const response = await fetch({ method: 'POST' })
          expect(response.status).toBe(405)

          const result = await response.json()
          expect(result.files.length).toBe(0)
        },
      })
    })

    test('* GET protected path', async () => {
      const params = { path: '../' }
      await testApiHandler({
        appHandler: { GET },
        url: `/my-url?path=/${params.path}`,
        test: async ({ fetch }) => {
          const response = await fetch({ method: 'GET' })
          const result = await response.json()

          expect(response.status).toBe(404)

          expect(result.files.length).toBe(0)
        },
      })
    })
  })
})
