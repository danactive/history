import { testApiHandler } from 'next-test-api-route-handler'
import fs from 'node:fs'
import path from 'node:path'
import { promisify } from 'node:util'

import handler from '..'
import utilsFactory from '../../../../../src/lib/utils'

describe('Filesystem API', () => {
  describe('Expect result', () => {
    test('* GET root has favicon', async () => {
      const test = async ({ fetch }) => {
        const response = await fetch({ method: 'GET' })
        const result = await response.json()

        expect(response.status).toBe(200)

        expect(result.files.length).toBeGreaterThan(0)

        const filenames = result.files.map((fileMeta) => fileMeta.filename)
        expect(filenames.includes('favicon.ico')).toBeTruthy()
      }
      await testApiHandler({ handler, test })
    })

    function matchFile(expect, file) {
      expect(file.filename).toEqual('P1160066.JPG')
      expect(file.ext).toEqual('JPG')
      expect(file.mediumType).toEqual('image')
      expect(file.name).toEqual('P1160066')
    }

    test('* GET fixtures has test files', async () => {
      const params = { path: 'test/fixtures/walkable' }
      const test = async ({ fetch }) => {
        const response = await fetch({ method: 'GET' })
        const result = await response.json()

        expect(response.status).toBe(200)

        matchFile(expect, result.files[2])
        expect(result.files.length).toEqual(3)
      }
      await testApiHandler({ handler, test, params })
    })

    test('* GET fixtures has test files with space in path', async () => {
      const params = { path: 'test/fixtures/walk%20able' }
      const test = async ({ fetch }) => {
        const response = await fetch({ method: 'GET' })
        const result = await response.json()

        expect(response.status).toBe(200)

        matchFile(expect, result.files[0])
        expect(result.files.length).toEqual(1)
      }
      await testApiHandler({ handler, test, params })
    })

    test('* GET fixtures and verify all files exist in the filesystem', async () => {
      const params = { path: 'test/fixtures/walkable' }
      const test = async ({ fetch }) => {
        const response = await fetch({ method: 'GET' })
        const result = await response.json()

        expect(response.status).toBe(200)

        const utils = utilsFactory()
        const fsAccess = promisify(fs.access)

        const publicPath = utils.safePublicPath('/')

        await result.files.forEach(async (file) => {
          try {
            const filenamePath = path.join(publicPath, params.path, file.filename)
            const options = fs.constants.R_OK | fs.constants.W_OK // eslint-disable-line no-bitwise
            const existsError = await fsAccess(filenamePath, options)
            expect(existsError).toBeUndefined()
          } catch (error) {
            expect(error.message).toBeUndefined()
          }
        })
      }
      await testApiHandler({ handler, test, params })
    })
  })

  describe('Expect error', () => {
    test('* POST verb is denied', async () => {
      const test = async ({ fetch }) => {
        const response = await fetch({ method: 'POST' })
        const result = await response.json()

        expect(response.status).toBe(405)

        expect(result.files.length).toBe(0)
      }
      await testApiHandler({ handler, test })
    })

    test('* GET protected path', async () => {
      const params = { path: '../' }
      const test = async ({ fetch }) => {
        const response = await fetch({ method: 'GET' })
        const result = await response.json()

        expect(response.status).toBe(404)

        expect(result.files.length).toBe(0)
      }
      await testApiHandler({ handler, test, params })
    })
  })
})
