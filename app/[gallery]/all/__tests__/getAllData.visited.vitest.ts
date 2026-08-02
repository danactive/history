import { describe, expect, test, vi } from 'vitest'

import { getAllData } from '../../../../src/lib/all'
import type { Gallery, Item } from '../../../../src/types/common'

vi.mock('../../../../src/lib/albums', () => ({
  __esModule: true,
  default: async (gallery: Gallery) => ({
    [gallery]: {
      albums: [
        { name: 'Flights' },
        { name: 'Europe' },
        { name: 'USA' },
      ],
    },
  }),
}))

function buildItem(
  id: string,
  filename: string,
  city: string,
  persons: Item['persons'] = null,
  coordinates: Item['coordinates'] = null,
): Item {
  return {
    id,
    filename,
    photoDate: null,
    city,
    location: null,
    caption: '',
    description: null,
    search: null,
    persons,
    title: '',
    coordinates,
    coordinateAccuracy: null,
    thumbPath: '',
    photoPath: '',
    mediaPath: '',
    videoPaths: null,
    reference: null,
  }
}

vi.mock('../../../../src/lib/album', () => ({
  __esModule: true,
  default: async (_gallery: string, albumName: string) => {
    if (albumName === 'Flights') {
      return {
        album: {
          meta: { geo: { zoom: 8 } },
          items: [
            buildItem('flight-ch', '2018-01-01-01.jpg', 'Zürich, Switzerland, Aeroplane', null, [10, 10]),
            buildItem('flight-us', '2016-03-25-01.jpg', 'Straits of Florida, USA, Aeroplane'),
          ],
        },
      }
    }

    if (albumName === 'Europe') {
      return {
        album: {
          meta: { geo: { zoom: 7 } },
          items: [
            buildItem('alice-only', '1999-05-06-01.jpg', 'Zürich, Switzerland', [{ full: 'Alice Example', dob: null }], [10, 10]),
            buildItem('lausanne-1', '1999-05-06-02.jpg', 'Lausanne, Switzerland'),
          ],
        },
      }
    }

    return {
      album: {
        meta: { geo: { zoom: 6 } },
        items: [
          buildItem('wa-1', '2016-03-26-90.jpg', 'Washington, USA'),
          buildItem('sea-1', '2016-03-26-91.jpg', 'Seattle, Washington, USA'),
        ],
      },
    }
  },
}))

describe('getAllData visited filtering', () => {
  test('does not include two-part Switzerland entries in Aeroplane/Switzerland results', async () => {
    const gallery: Gallery = 'demo'

    const { items, totalItemCount } = await getAllData({
      gallery,
      query: 'country:Aeroplane && region:Switzerland',
    })

    expect(items.map((item) => item.filename)).toEqual(['2018-01-01-01.jpg'])
    expect(items[0]?.visitedPlace).toEqual({ country: 'Aeroplane', region: 'Switzerland' })
    expect(totalItemCount).toBe(6)
  })

  test('does not include two-part USA entries in Aeroplane/USA results', async () => {
    const gallery: Gallery = 'demo'

    const { items, totalItemCount } = await getAllData({
      gallery,
      query: 'country:Aeroplane && region:USA',
    })

    expect(items.map((item) => item.filename)).toEqual(['2016-03-25-01.jpg'])
    expect(items[0]?.visitedPlace).toEqual({ country: 'Aeroplane', region: 'USA' })
    expect(totalItemCount).toBe(6)
  })

  test('supports a canonical person query', async () => {
    const gallery: Gallery = 'demo'

    const { items, totalItemCount } = await getAllData({
      gallery,
      query: 'person:"Alice Example"',
    })

    expect(items.map((item) => item.id)).toEqual(['alice-only'])
    expect(totalItemCount).toBe(6)
  })

  test('keeps the map-bounded total when the query narrows the returned items', async () => {
    const result = await getAllData({
      gallery: 'demo',
      query: 'person:"Alice Example"',
      mapBounds: [[0, 0], [20, 20]],
    })

    expect(result.items.map((item) => item.id)).toEqual(['alice-only'])
    expect(result.totalItemCount).toBe(2)
  })
})
