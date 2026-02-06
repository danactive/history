// @vitest-environment node

import { describe, expect, test } from 'vitest'

import fs from 'node:fs'
import path from 'node:path'
import { promisify } from 'node:util'
import { NextRequest } from 'next/server'

import { GET, POST } from '../../app/api/admin/filesystems/route'
import utilsFactory from '../../src/lib/utils'
import type { Filesystem } from '../../src/lib/filesystems'

describe('Filesystem API', () => {
  describe('Expect result', () => {
    test('* GET root has favicon', async () => {
      const res = await GET(new NextRequest('http://test?path=/'))
      expect(res.status).toBe(200)

      const result = await res.json()
      expect(Array.isArray(result.files)).toBe(true)
      expect(result.files.length).toBeGreaterThan(0)

      const filenames = result.files.map((f: Filesystem) => f.filename)
      expect(filenames.includes('favicon.ico')).toBe(true)
    })

    function matchPFile(file: Filesystem) {
      expect(file.filename).toEqual('P1160066.JPG')
      expect(file.ext).toEqual('JPG')
      expect(file.mediumType).toEqual('image')
      expect(file.name).toEqual('P1160066')
    }

    function matchJFile(file: Filesystem) {
      expect(file.filename).toEqual('jay.js')
      expect(file.ext).toEqual('js')
      expect(file.mediumType).toEqual('text')
      expect(file.name).toEqual('jay')
    }

    test('* GET fixtures has test files', async () => {
      const params = { path: 'test/fixtures/walkable' }
      const response = await GET(new NextRequest(`http://test?path=/${params.path}`))
      const result = await response.json()

      expect(response.status).toBe(200)

      matchPFile(result.files[1])
      matchJFile(result.files[0])
      expect(result.files.length).toEqual(3)
    })

    test('* GET fixtures has test files with space in path', async () => {
      const params = { path: 'test/fixtures/walk%20able' }
      const response = await GET(new NextRequest(`http://test?path=/${params.path}`))
      const result = await response.json()

      expect(response.status).toBe(200)

      matchPFile(result.files[0])
      expect(result.files.length).toEqual(1)
    })

    test('* GET fixtures and verify all files exist in the filesystem', async () => {
      const params = { path: 'test/fixtures/walkable' }
      const response = await GET(new NextRequest(`http://test?path=/${params.path}`))
      const result = await response.json()

      expect(response.status).toBe(200)

      const utils = utilsFactory()
      const fsAccess = promisify(fs.access)

      const publicPath = utils.safePublicPath('/')

      await result.files.forEach(async (file: Filesystem) => {
        try {
          const filenamePath = path.join(publicPath, params.path, file.filename)
          const options = fs.constants.R_OK | fs.constants.W_OK  
          const existsError = await fsAccess(filenamePath, options)
          expect(existsError).toBeUndefined()
        } catch (error) {
          expect((error as Error).message).toBeUndefined()
        }
      })
    })
  })

  describe('Expect error', () => {
    test('* POST verb is denied', async () => {
      const params = { path: '/' }
      const response = await POST(new NextRequest(`http://test?path=/${params.path}`, { method: 'POST' }))
      expect(response.status).toBe(405)

      const result = await response.json()
      expect(result.files.length).toBe(0)
      expect(result.error.message.toLowerCase()).toContain('not allowed')
    })

    test('* GET protected path', async () => {
      const params = { path: '../' }
      const response = await GET(new NextRequest(`http://test?path=/${params.path}`))
      const result = await response.json()

      expect(response.status).toBe(404)

      expect(result.files.length).toBe(0)
    })
  })
})
