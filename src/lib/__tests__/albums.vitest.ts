import { describe, expect, test } from 'vitest'
import config from '../../models/config'
import type { AlbumsBody, Gallery } from '../../types/common'
import { getAvailableGalleries } from '../../types/generated'
import { readGallery, transformJsonSchema, type GalleryAlbumsBody } from '../albums'

describe('Albums library', () => {
  test('lists only generated galleries returned by the album loader', () => {
    const galleryAlbums: Partial<GalleryAlbumsBody> = {
      demo: { albums: [] },
    }

    expect(getAvailableGalleries(galleryAlbums)).toEqual(['demo'])
  })

  describe('readGallery', () => {
    const unit = async (gallery: Gallery) => transformJsonSchema(await readGallery(gallery), gallery)

    test('Default Album', async () => {
      const actual = await unit(config.defaultGallery)
      const expected: AlbumsBody = {
        albums: [
          {
            name: 'sample',
            h1: 'Sample',
            h2: 'British Columbia',
            version: '2.2',
            thumbPath: '/galleries/demo/media/thumbs/2004/2004-01-04-01.jpg',
            year: '2001-2005',
            search: '2001, 2004, British Columbia, Cook Islands',
          },
        ],
      }
      expect(actual).toEqual(expected)
    })
  })
})
