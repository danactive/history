import { describe, expect, test, vi } from 'vitest'

import { getAllData } from '../../../../src/lib/all'
import type { Gallery } from '../../../../src/types/common'

// Reduce mocks: keep only data providers (getAlbums/getAlbum). Use real config & search.
vi.mock('../../../../src/lib/albums', () => ({
  __esModule: true,
  default: async (gallery: Gallery) => ({
    [gallery]: {
      albums: [
        { name: 'Alpha', year: '2024' },
        { name: 'Beta', year: '2025' },
        { name: 'Undated', year: '' },
      ],
    },
  }),
}))

vi.mock('../../../../src/lib/album', () => ({
  __esModule: true,
  default: async (_gallery: Gallery, albumName: string) => {
    if (albumName === 'Alpha') {
      return {
        album: {
          meta: { geo: { zoom: 8 } },
          items: [
            { id: 'A50', filename: ['1920-01-01-50.jpg'], description: 'd', caption: 'c', location: 'loc', city: 'city', search: 's' },
            { id: 'A90', filename: ['1920-01-01-90.jpg'], description: 'd', caption: 'c', location: 'loc', city: 'city', search: 's' },
            { id: 'A10', filename: ['2010-01-01-10.jpg'], description: 'd', caption: 'c', location: 'loc', city: 'city', search: 's' },
            { id: 'A20', filename: ['2020-01-01-20.jpg'], description: 'd', caption: 'c', location: 'loc', city: 'city', search: 's' },
          ],
        },
      }
    }
    if (albumName === 'Beta') {
      return {
        album: {
          meta: { geo: { zoom: 6 } },
          items: [
            { id: 'B24', filename: ['2024-01-01-24.jpg'], description: 'd', caption: 'c', location: 'loc', city: 'city', search: 's' },
            { id: 'B24X', filename: ['2024-01-01-24.jpg'], description: 'd', caption: 'c', location: 'loc', city: 'city', search: 's' },
          ],
        },
      }
    }
    return {
      album: {
        meta: { geo: { zoom: 4 } },
        items: [
          { id: 'U90', filename: ['2035-01-01-90.jpg'], description: 'd', caption: 'c', location: 'loc', city: 'city', search: 's' },
          { id: 'U10', filename: ['2018-01-01-10.jpg'], description: 'd', caption: 'c', location: 'loc', city: 'city', search: 's' },
        ],
      },
    }
  },
}))

// Real modules for search & config are used (no mocks)

// Tests
describe('getAllData ordering', () => {
  test('groups albums by newest year, leaves undated albums last, and sorts each album oldest first', async () => {
    const gallery: Gallery = 'demo'
    const { items } = await getAllData({ gallery })
    const ids = items.map(i => i.id)
    expect(ids).toEqual(['B24', 'B24X', 'A50', 'A90', 'A10', 'A20', 'U10', 'U90'])
  })

  test('coordinateAccuracy falls back to album meta zoom per album', async () => {
    const gallery: Gallery = 'demo'
    const { items } = await getAllData({ gallery })
    const alphaZooms = items.filter(i => i.id.startsWith('A')).map(i => i.coordinateAccuracy)
    const betaZooms = items.filter(i => i.id.startsWith('B')).map(i => i.coordinateAccuracy)
    expect(new Set(alphaZooms)).toEqual(new Set([8]))
    expect(new Set(betaZooms)).toEqual(new Set([6]))
  })
})
