// @vitest-environment node

import { describe, expect, test, vi } from 'vitest'

import { NextRequest } from 'next/server'

const { getAlbumsMock, readAlbumMock } = vi.hoisted(() => ({
  getAlbumsMock: vi.fn(),
  readAlbumMock: vi.fn(),
}))

vi.mock('../../src/lib/albums', () => ({
  __esModule: true,
  default: getAlbumsMock,
}))

vi.mock('../../src/lib/xml', () => ({
  __esModule: true,
  rawParseOptions: {},
  readAlbum: readAlbumMock,
}))

import { GET } from '../../app/api/admin/search/route'

describe('admin search route', () => {
  test('searches only the galleries returned by getAlbums', async () => {
    getAlbumsMock.mockResolvedValue({
      demo: {
        albums: [{ name: 'album-1' }],
      },
    })
    readAlbumMock.mockResolvedValue({
      album: {
        item: [
          { filename: 'match.jpg' },
        ],
      },
    })

    const response = await GET(new NextRequest('http://test/api/admin/search?query=match'))
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body).toEqual({
      results: [
        {
          gallery: 'demo',
          album: 'album-1',
          filename: 'match.jpg',
          index: 0,
        },
      ],
    })
  })
})
