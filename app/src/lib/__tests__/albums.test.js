import lib from '../albums'
import config from '../../../../config.json'

describe('Albums library', () => {
  describe('getGalleryFromFilesystem', () => {
    const unit = async (gallery) => lib.transformJsonSchema(await lib.getGalleryFromFilesystem(gallery), gallery)

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
          },
        ],
      }
      expect(actual).toEqual(expected)
    })
  })
})
