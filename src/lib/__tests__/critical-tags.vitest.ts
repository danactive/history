import { describe, expect, test } from 'vitest'

import { auditCriticalTags, getMedian, parseSearchTags } from '../critical-tags'
import type { GalleryAlbum } from '../../types/common'

function makeAlbum(name: string, h1: string): GalleryAlbum {
  return {
    name,
    h1,
    h2: '',
    version: '',
    thumbPath: '',
    year: '',
    search: null,
  }
}

describe('critical tag audit', () => {
  test('counts unique tagged media and albums below the median', () => {
    const audit = auditCriticalTags([
      {
        gallery: 'demo',
        album: makeAlbum('untagged', 'Untagged'),
        items: [{ search: 'holiday, mountain' }],
      },
      {
        gallery: 'demo',
        album: makeAlbum('median', 'Median'),
        items: [{ search: 'BEST^, holiday' }],
      },
      {
        gallery: 'demo',
        album: makeAlbum('well-tagged', 'Well tagged'),
        items: [
          { search: 'best^, hightlight^' },
          { search: 'hightlight^' },
          { search: 'hightlight^, hightlight^' },
        ],
      },
    ], ['hightlight^', 'best^'])

    expect(audit.medianCriticalMediaCount).toBe(2)
    expect(audit.albumsWithoutCriticalTags.map(album => album.album.name)).toEqual(['untagged'])
    expect(audit.albumsBelowMedian.map(album => album.album.name)).toEqual(['median'])
    expect(audit.albums.find(album => album.album.name === 'well-tagged')).toMatchObject({
      criticalMediaCount: 3,
    })
  })

  test('calculates an even-sized median and splits comma-separated search values', () => {
    expect(getMedian([4, 0, 2, 10])).toBe(3)
    expect(parseSearchTags(' one, two , ,three ')).toEqual(['one', 'two', 'three'])
  })
})
