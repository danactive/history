import { testApiHandler } from 'next-test-api-route-handler'
import fs from 'node:fs'
import path from 'node:path'
import { promisify } from 'node:util'

import handler from '..'
import utilsFactory from '../../../../../src/lib/utils'
import type { Filesystem } from '../../../../../src/lib/filesystems'

describe('Filesystem API', () => {
  describe('Expect result', () => {
    test('* GET root has favicon', async () => {
      await testApiHandler({
        handler,
        test: async ({ fetch }) => {
          const response = await fetch({ method: 'GET' })
          const result = await response.json()

          expect(response.status).toBe(200)

          expect(result.files.length).toBeGreaterThan(0)

          const filenames = result.files.map((fileMeta: Filesystem) => fileMeta.filename)
          expect(filenames.includes('favicon.ico')).toBeTruthy()
        },
      })
    })

    function matchFile(expect: jest.Expect, file: Filesystem) {
      expect(file.filename).toEqual('P1160066.JPG')
      expect(file.ext).toEqual('JPG')
      expect(file.mediumType).toEqual('image')
      expect(file.name).toEqual('P1160066')
    }

    test('* GET fixtures has test files', async () => {
      await testApiHandler({
        handler,
        test: async ({ fetch }) => {
          const response = await fetch({ method: 'GET' })
          const result = await response.json()

          expect(response.status).toBe(200)

          matchFile(expect, result.files[2])
          expect(result.files.length).toEqual(3)
        },
        params: { path: 'test/fixtures/walkable' },
      })
    })

    test('* GET fixtures has test files with space in path', async () => {
      await testApiHandler({
        handler,
        test: async ({ fetch }) => {
          const response = await fetch({ method: 'GET' })
          const result = await response.json()

          expect(response.status).toBe(200)

          matchFile(expect, result.files[0])
          expect(result.files.length).toEqual(1)
        },
        params: { path: 'test/fixtures/walk%20able' },
      })
    })

    test('* GET fixtures and verify all files exist in the filesystem', async () => {
      const params = { path: 'test/fixtures/walkable' }
      await testApiHandler({
        handler,
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
        params,
      })
    })
  })

  describe('Expect error', () => {
    test('* POST verb is denied', async () => {
      await testApiHandler({
        handler,
        test: async ({ fetch }) => {
          const response = await fetch({ method: 'POST' })
          const result = await response.json()

          expect(response.status).toBe(405)

          expect(result.files.length).toBe(0)
        },
      })
    })

    test('* GET protected path', async () => {
      await testApiHandler({
        handler,
        test: async ({ fetch }) => {
          const response = await fetch({ method: 'GET' })
          const result = await response.json()

          expect(response.status).toBe(404)

          expect(result.files.length).toBe(0)
        },
        params: { path: '../' },
      })
    })
  })
})
