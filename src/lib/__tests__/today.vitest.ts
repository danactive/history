import { beforeEach, describe, expect, test, vi } from 'vitest'

const getAlbum = vi.hoisted(() => vi.fn())
const getAlbums = vi.hoisted(() => vi.fn())
const buildVisitedDataFromItems = vi.hoisted(() => vi.fn())

vi.mock('../album', () => ({
  __esModule: true,
  default: getAlbum,
}))

vi.mock('../albums', () => ({
  __esModule: true,
  default: getAlbums,
}))

vi.mock('../visited', async () => {
  const actual = await vi.importActual<typeof import('../visited')>('../visited')
  return {
    ...actual,
    buildVisitedDataFromItems,
  }
})

import { getTodayItems } from '../today'

beforeEach(() => {
  getAlbums.mockReset()
  getAlbum.mockReset()
  buildVisitedDataFromItems.mockReset()

  getAlbums.mockResolvedValue({
    demo: {
      albums: [
        { name: 'sample-a', h1: 'Sample A', h2: '', version: '1', filename: '', year: '2024', search: null },
        { name: 'sample-b', h1: 'Sample B', h2: '', version: '1', filename: '', year: '2025', search: null },
      ],
    },
  })

  getAlbum.mockImplementation(async (_gallery: string, album: string) => ({
    album: {
      meta: { geo: { zoom: 9 } },
      items: album === 'sample-a'
        ? [
            {
              id: '1',
              filename: '2024-07-18-01.jpg',
              photoDate: '2024-07-18',
              city: 'Alpha City',
              location: 'Alpha Park',
              caption: 'Alpha',
              description: null,
              search: 'Taylor Example',
              persons: [{ full: 'Taylor Example', dob: null }],
              title: 'Alpha',
              coordinates: null,
              coordinateAccuracy: null,
              thumbPath: '',
              photoPath: '',
              mediaPath: '',
              videoPaths: null,
              reference: null,
            },
            {
              id: '2',
              filename: '2024-07-18-02.jpg',
              photoDate: '2024-07-18',
              city: 'Alpha City',
              location: 'Alpha Museum',
              caption: 'Beta',
              description: null,
              search: 'Taylor Example',
              persons: [{ full: 'Taylor Example', dob: null }],
              title: 'Beta',
              coordinates: null,
              coordinateAccuracy: null,
              thumbPath: '',
              photoPath: '',
              mediaPath: '',
              videoPaths: null,
              reference: null,
            },
          ]
        : [
            {
              id: '3',
              filename: '2025-07-18-01.jpg',
              photoDate: '2025-07-18',
              city: 'Beta City',
              location: 'Beta Hall',
              caption: 'Gamma',
              description: null,
              search: 'Jordan Sample',
              persons: [{ full: 'Jordan Sample', dob: null }],
              title: 'Gamma',
              coordinates: null,
              coordinateAccuracy: null,
              thumbPath: '',
              photoPath: '',
              mediaPath: '',
              videoPaths: null,
              reference: null,
            },
            {
              id: '4',
              filename: '2025-07-18-02.jpg',
              photoDate: '2025-07-18',
              city: 'Beta City',
              location: 'Beta Plaza',
              caption: 'Delta',
              description: null,
              search: 'Taylor Example',
              persons: [{ full: 'Taylor Example', dob: null }],
              title: 'Delta',
              coordinates: null,
              coordinateAccuracy: null,
              thumbPath: '',
              photoPath: '',
              mediaPath: '',
              videoPaths: null,
              reference: null,
            },
          ],
    },
  }))

  buildVisitedDataFromItems.mockReturnValue([
    {
      country: 'Exampleland',
      count: 4,
      filter: { country: 'Exampleland', region: null },
      regions: [
        {
          count: 3,
          filter: { country: 'Exampleland', region: 'North Example' },
        },
        {
          count: 1,
          filter: { country: 'Exampleland', region: 'South Example' },
        },
      ],
    },
    {
      country: 'Sampleria',
      count: 2,
      filter: { country: 'Sampleria', region: null },
      regions: [],
    },
  ])
})

describe('today library', () => {
  test('orders location options by highest count first', async () => {
    const result = await getTodayItems('demo', '07-18')
    const counts = result.locationOptions.map((option) => option.count)

    expect(counts.length).toBeGreaterThan(1)
    expect(counts).toEqual([...counts].sort((left, right) => right - left))
  })

  test('orders person options by highest count first', async () => {
    const result = await getTodayItems('demo', '07-18')
    const counts = result.personOptions.map((option) => option.count)

    expect(counts.length).toBeGreaterThan(1)
    expect(counts).toEqual([...counts].sort((left, right) => right - left))
  })
})
