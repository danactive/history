// @vitest-environment node

import { beforeEach, describe, expect, test, vi } from 'vitest'

import { NextRequest } from 'next/server'

const mocks = vi.hoisted(() => {
  class InvalidAlbumXmlError extends Error {}
  return {
    InvalidAlbumXmlError,
    readAlbum: vi.fn(),
    writeAlbum: vi.fn(),
  }
})

vi.mock('../../src/lib/xml', () => ({
  __esModule: true,
  InvalidAlbumXmlError: mocks.InvalidAlbumXmlError,
  rawParseOptions: {},
  readAlbum: mocks.readAlbum,
  writeAlbum: mocks.writeAlbum,
}))

import { PUT } from '../../app/api/admin/xml/[gallery]/[album]/route'

const params = { params: Promise.resolve({ gallery: 'demo' as const, album: 'sample' }) }
const validXml = '<?xml version="1.0" encoding="UTF-8"?><album><item id="1" /></album>'

describe('admin XML save route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('saves the XML request body for the selected gallery and album', async () => {
    mocks.writeAlbum.mockResolvedValueOnce(undefined)

    const response = await PUT(new NextRequest('http://test/api/admin/xml/demo/sample', {
      method: 'PUT',
      body: JSON.stringify({ xml: validXml }),
    }), params)

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ saved: true })
    expect(mocks.writeAlbum).toHaveBeenCalledWith('demo', 'sample', validXml)
  })

  test('rejects a request without XML before attempting a write', async () => {
    const response = await PUT(new NextRequest('http://test/api/admin/xml/demo/sample', {
      method: 'PUT',
      body: JSON.stringify({}),
    }), params)

    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({ error: 'XML content is required' })
    expect(mocks.writeAlbum).not.toHaveBeenCalled()
  })

  test('rejects whitespace-only XML before attempting a write', async () => {
    const response = await PUT(new NextRequest('http://test/api/admin/xml/demo/sample', {
      method: 'PUT',
      body: JSON.stringify({ xml: '  \n\t' }),
    }), params)

    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({ error: 'XML content is required' })
    expect(mocks.writeAlbum).not.toHaveBeenCalled()
  })

  test('reports malformed XML without saving', async () => {
    mocks.writeAlbum.mockRejectedValueOnce(new mocks.InvalidAlbumXmlError('XML must be well formed'))

    const response = await PUT(new NextRequest('http://test/api/admin/xml/demo/sample', {
      method: 'PUT',
      body: JSON.stringify({ xml: '<album>' }),
    }), params)

    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({ error: 'XML must be well formed' })
  })
})
