import config from '../../models/config'
import type { Gallery } from '../../types/common'
import { readGallery, transformJsonSchema } from '../albums'

describe('Albums library', () => {
  describe('readGallery', () => {
    const unit = async (gallery: Gallery) => transformJsonSchema(await readGallery(gallery), gallery)

    test('Default Album', async () => {
      const actual = await unit(config.defaultGallery)
      const expected = {
        albums: [
          {
            name: 'sample',
            h1: 'Sample',
            h2: 'British Columbia',
            version: '1.8',
            thumbPath: '/galleries/demo/media/thumbs/2004/2004-01-04-01.jpg',
            year: '2001-2005',
            search: '2001, 2004, British Columbia',
          },
        ],
      }
      expect(actual).toEqual(expected)
    })
  })
})
