import { getAllData } from '../page'
import type { Gallery } from '../../../../src/types/common'

// Reduce mocks: keep only data providers (getAlbums/getAlbum). Use real config & search.
jest.mock('../../../../src/lib/albums', () => ({
  __esModule: true,
  default: async (gallery: string) => ({
    [gallery]: {
      albums: [
        { name: 'Alpha' },
        { name: 'Beta' },
      ],
    },
  }),
}))

jest.mock('../../../../src/lib/album', () => ({
  __esModule: true,
  default: async (_gallery: string, albumName: string) => {
    if (albumName === 'Alpha') {
      return {
        album: {
          meta: { geo: { zoom: 8 } },
          items: [
            { id: 'A00', filename: ['A1-2000.jpg'], description: 'd', caption: 'c', location: 'loc', city: 'city', search: 's' },
            { id: 'A05', filename: ['A2-2005.jpg'], description: 'd', caption: 'c', location: 'loc', city: 'city', search: 's' },
            { id: 'A10', filename: ['A3-2010.jpg'], description: 'd', caption: 'c', location: 'loc', city: 'city', search: 's' },
            { id: 'A20', filename: ['A4-2020.jpg'], description: 'd', caption: 'c', location: 'loc', city: 'city', search: 's' },
          ],
        },
      }
    }
    return {
      album: {
        meta: { geo: { zoom: 6 } },
        items: [
          { id: 'B1', filename: ['B1.jpg'], description: 'd', caption: 'c', location: 'loc', city: 'city', search: 's' },
          { id: 'B2', filename: ['B2.jpg'], description: 'd', caption: 'c', location: 'loc', city: 'city', search: 's' },
        ],
      },
    }
  },
}))

// Real modules for search & config are used (no mocks)

// Tests
describe('getAllData ordering', () => {
  test('order is expected', async () => {
    const gallery: Gallery = 'demo'
    const { items } = await getAllData({ gallery })
    const ids = items.map(i => i.id)
    expect(ids).toEqual(['B1', 'B2', 'A00', 'A05', 'A10', 'A20'])
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
