import lib from '../album'

describe('Album library', () => {
  const gallery = 'demo'
  describe('jpgFilenameInsensitive', () => {
    const unit = lib.jpgFilenameInsensitive

    test('jpg', () => {
      const actual = unit('filename.jpg')
      const expected = 'filename.jpg'
      expect(actual).toBe(expected)
    })
    test('JPG', () => {
      const actual = unit('filename.JPG')
      const expected = 'filename.JPG'
      expect(actual).toBe(expected)
    })
    test('JPg', () => {
      const actual = unit('filename.JPg')
      const expected = 'filename.JPg'
      expect(actual).toBe(expected)
    })
    test('JPeG', () => {
      const actual = unit('filename.JPeG')
      const expected = 'filename.jpg'
      expect(actual).toBe(expected)
    })
    test('jpeg', () => {
      const actual = unit('filename.jpeg')
      const expected = 'filename.jpg'
      expect(actual).toBe(expected)
    })
    test('png', () => {
      const actual = unit('filename.png')
      const expected = 'filename.jpg'
      expect(actual).toBe(expected)
    })
  })

  test('getThumbPath', () => {
    const item = { filename: '2016-12-31-01.jpg' }
    const expectedPath = `/galleries/${gallery}/media/thumbs/2016/${item.filename}`
    expect(lib.getThumbPath(item, gallery)).toBe(expectedPath)
  })

  describe('getVideoPath', () => {
    test('Just filename', () => {
      const item = { filename: '2016-12-31-01.mp4' }
      const expectedPath = `/view/video?sources=${item.filename}&w=&h=&gallery=${gallery}`
      expect(lib.getVideoPath(item, gallery)).toBe(expectedPath)
    })

    test('All', () => {
      const item = { filename: '2016-12-31-01.mp4', size: { w: 1, h: 2 } }
      const expectedPath = `/view/video?sources=${item.filename}&w=${item.size.w}&h=${item.size.h}&gallery=${gallery}`
      expect(lib.getVideoPath(item, gallery)).toBe(expectedPath)
    })
  })

  describe('transformJsonSchema', () => {
    test('Blank', () => {
      const result = lib.transformJsonSchema()
      expect(result).toEqual({})
    })

    test('Meta', () => {
      const mock = { album: { meta: 'Self talk' } }
      const result = lib.transformJsonSchema(mock)
      expect(result).toEqual(mock)
    })

    test('Meta with id', () => {
      const mock = { album: { meta: 'Self talk' } }
      mock.album.item = [{ $: { id: 1 } }]
      const result = lib.transformJsonSchema(mock)
      expect(result.album.meta).toEqual(mock.album.meta)
      expect(result.album.items[0].$).toEqual(mock.album.item[0].$)
    })

    test('Raw items', () => {
      const mock = {
        album: {
          meta: { gallery: 'demo' },
          item: [
            {
              $: { id: 1 },
              filename: '2016-Image-Filename.jpg',
              photoDesc: 'Desc',
              photoCity: 'City',
              thumbCaption: 'Caption',
            },
            {
              $: { id: 2 },
              type: 'video',
              filename: ['2016-Video-Filename.mov', '2016-Video-Filename.avi'],
              size: { w: 1280, h: 720 },
              photoDesc: 'Desc',
              photoCity: 'City',
              thumbCaption: 'Caption',
            },
          ],
        },
      }
      const result = lib.transformJsonSchema(mock)

      expect(result.album.meta).toEqual(mock.album.meta) // Meta (w/ Items)
      expect(result.album.items[0].$).toEqual(mock.album.item[0].$) // Items (w/ Meta)
      expect(result.album.items[0].caption).toEqual('Caption') // Image Caption
      expect(result.album.items[0].thumbCaption).toEqual('Caption') // Image Thumb Caption'
      expect(result.album.items[0].title).toEqual('City: Desc') // Title'
      expect(result.album.items[0].thumbPath).toEqual('/galleries/demo/media/thumbs/2016/2016-Image-Filename.jpg') // Thumb Path
      expect(result.album.items[0].mediaPath).toEqual('/galleries/demo/media/photos/2016/2016-Image-Filename.jpg') // Photo Path
      expect(result.album.items[1].caption).toEqual('Caption') // Video Caption
      expect(result.album.items[1].thumbCaption).toEqual('Video: Caption') // Video Thumb Caption
      expect(result.album.items[1].mediaPath)
        .toEqual('/view/video?sources=2016-Video-Filename.mov,2016-Video-Filename.avi&w=1280&h=720&gallery=demo') // Video Path
    })
  })
})
