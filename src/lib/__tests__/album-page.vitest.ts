import { beforeEach, describe, expect, test, vi } from 'vitest'

const getAlbum = vi.hoisted(() => vi.fn())

vi.mock('../album', () => ({
  __esModule: true,
  default: getAlbum,
}))

import { getAlbumData } from '../album-page'

beforeEach(() => {
  getAlbum.mockReset()

  getAlbum.mockResolvedValue({
    album: {
      meta: { geo: { zoom: 9 } },
      items: [
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
          search: 'Jordan Sample',
          persons: [{ full: 'Jordan Sample', dob: null }],
          title: 'Beta',
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
  })
})

describe('album page data', () => {
  test('keeps album search options backend-classified and exposes tag options', async () => {
    getAlbum.mockResolvedValueOnce({
      album: {
        meta: { geo: { zoom: 8 } },
        items: [
          {
            id: '1',
            filename: '2026-01-01-01.jpg',
            photoDate: '2026-01-01',
            city: 'Demo City, Demo Region, Demo Country',
            location: null,
            caption: 'Caption',
            description: null,
            search: 'tag^, First Middle Last, 2026',
            persons: null,
            title: 'Title',
            coordinates: null,
            coordinateAccuracy: 0,
            thumbPath: '',
            photoPath: '',
            mediaPath: '',
            videoPaths: null,
            reference: null,
          },
        ],
      },
    })

    const result = await getAlbumData({
      gallery: 'demo',
      album: 'album-one',
    })

    expect(result.indexedKeywords).toEqual(expect.arrayContaining([
      expect.objectContaining({ value: 'tag^', filterKind: 'tag' }),
      expect.objectContaining({ value: 'First Middle Last', filterKind: 'person' }),
      expect.objectContaining({ value: '2026', filterKind: 'year' }),
    ]))

    expect(result.tagOptions).toEqual(expect.arrayContaining([
      expect.objectContaining({ value: 'tag^', filterKind: 'tag' }),
    ]))
  })

  test('filters album items by selected person before rebuilding metadata', async () => {
    const result = await getAlbumData({
      gallery: 'demo',
      album: 'sample',
      selectedPerson: 'Taylor Example',
    })

    expect(result.items.map((item) => item.id)).toEqual(['1'])
    expect(result.totalItemCount).toBe(2)
    expect(result.visitedPlace).toBeNull()
    expect(result.visitedFilterLabel).toBeNull()
    expect(result.indexedKeywords.map((option) => option.value)).toContain('Taylor Example')
    expect(result.indexedKeywords.map((option) => option.value)).not.toContain('Jordan Sample')
  })
})
