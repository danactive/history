import { describe, expect, test, vi } from 'vitest'

import type { Gallery } from '../../types/common'
import { getPersonsData } from '../persons'

vi.mock('../albums', () => ({
  __esModule: true,
  default: async (gallery: Gallery) => ({
    [gallery]: {
      albums: [
        { name: 'older', year: '2018' },
        { name: 'newer', year: '2024' },
        { name: 'undated', year: '' },
      ],
    },
  }),
}))

vi.mock('../album', () => ({
  __esModule: true,
  default: async (_gallery: Gallery, albumName: string) => {
    const itemsByAlbum = {
      older: [
        { id: 'older-late', filename: '2029-01-01-90.jpg', city: 'Demo, Country' },
        { id: 'older-early', filename: '2020-01-01-10.jpg', city: 'Demo, Country' },
      ],
      newer: [
        { id: 'newer-late', filename: '2001-01-01-90.jpg', city: 'Demo, Country' },
        { id: 'newer-early', filename: '2001-01-01-10.jpg', city: 'Demo, Country' },
      ],
      undated: [
        { id: 'undated', filename: '2035-01-01-01.jpg', city: 'Demo, Country' },
      ],
    }
    return {
      album: {
        meta: { geo: { zoom: 8 } },
        items: itemsByAlbum[albumName as keyof typeof itemsByAlbum],
      },
    }
  },
}))

describe('persons library', () => {
  test('keeps person results grouped by newest album year and chronological within each album', async () => {
    const { items } = await getPersonsData({ gallery: 'demo' })

    expect(items.map((item) => item.id)).toEqual([
      'newer-early',
      'newer-late',
      'older-early',
      'older-late',
      'undated',
    ])
  })
})
