import lib from '../album'

describe('Album library', () => {
  const gallery = 'demo'
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
      expect(result.album.items[0].id).toEqual(mock.album.item[0].$.id)
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
              ref: {
                name: 'Purshia_tridentata',
                source: 'wikipedia',
              },
            },
          ],
        },
      }
      const result = lib.transformJsonSchema(mock)

      expect(result.album.meta).toEqual(mock.album.meta) // Meta (w/ Items)
      expect(result.album.items[0].id).toEqual(mock.album.item[0].$.id) // Items (w/ Meta)
      expect(result.album.items[0].caption).toEqual('Caption') // Image Caption
      expect(result.album.items[0].city).toEqual('City') // City
      expect(result.album.items[0].description).toEqual('Desc') // Description
      expect(result.album.items[0].title).toEqual('City: Desc') // Title
      expect(result.album.items[0].thumbPath).toEqual('/galleries/demo/media/thumbs/2016/2016-Image-Filename.jpg') // Thumb Path
      expect(result.album.items[0].photoPath).toEqual('/galleries/demo/media/photos/2016/2016-Image-Filename.jpg') // Photo Path
      expect(result.album.items[0].mediaPath).toEqual('/galleries/demo/media/photos/2016/2016-Image-Filename.jpg') // Photo Path
      expect(result.album.items[0].reference).toBeNull()
      expect(result.album.items[1].caption).toEqual('Video: Caption') // Video Thumb Caption
      expect(result.album.items[1].photoPath).toEqual('/galleries/demo/media/photos/2016/2016-Video-Filename.jpg') // Photo Path
      expect(result.album.items[1].mediaPath)
        .toEqual('/view/video?sources=2016-Video-Filename.mov,2016-Video-Filename.avi&w=1280&h=720&gallery=demo') // Video Path
      expect(result.album.items[1].reference).toEqual('https://en.wikipedia.org/wiki/Purshia_tridentata') // Wikipedia reference
    })
  })

  describe('reference', () => {
    test('YouTube', () => {
      const mock = {
        ref: {
          name: 'vancouver',
          source: 'youtube',
        },
      }
      expect(lib.reference(mock)).toBe('https://www.youtube.com/watch?v=vancouver')
    })
    test('Wiki', () => {
      const mock = {
        ref: {
          name: 'Purshia_tridentata',
          source: 'wikipedia',
        },
      }
      expect(lib.reference(mock)).toBe('https://en.wikipedia.org/wiki/Purshia_tridentata')
    })
  })
})
