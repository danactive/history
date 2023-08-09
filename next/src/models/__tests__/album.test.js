import transformJsonSchema, { reference } from '../album'

describe('Album library', () => {
  describe('transformJsonSchema', () => {
    test('Basic', () => {
      const result = transformJsonSchema()
      expect(result).toEqual({ album: { items: [] } })
    })

    test('Meta', () => {
      const mock = { album: { meta: { gallery: 'demo' } } }
      const result = transformJsonSchema(mock)
      expect(result.album.meta).toEqual(mock.album.meta)
      expect(result.album.items.length).toEqual(0)
    })

    test('Only one photo', () => {
      const mock = { album: { meta: { gallery: 'demo' } } }
      mock.album.item = { $: { id: 1 } }
      const expected = { gallery: 'demo', geo: { zoom: 17 } }
      const result = transformJsonSchema(mock)
      expect(result.album.meta).toEqual(expected)
      expect(result.album.items[0].id).toEqual(mock.album.item.$.id)
    })

    test('Raw items', () => {
      const expectedMeta = { gallery: 'demo', geo: { zoom: 15 } }
      const mock = {
        album: {
          meta: { gallery: 'demo', markerZoom: 15 },
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
              geo: {
                lat: '123',
                lon: '-543.21',
                accuracy: 15,
              },
              ref: {
                name: 'Purshia_tridentata',
                source: 'wikipedia',
              },
            },
          ],
        },
      }
      const result = transformJsonSchema(mock)

      expect(result.album.meta).toEqual(expectedMeta) // Meta (w/ Items)
      expect(result.album.items[0].id).toEqual(mock.album.item[0].$.id) // Items (w/ Meta)
      expect(result.album.items[0].caption).toEqual('Caption') // Image Caption
      expect(result.album.items[0].city).toEqual('City') // City
      expect(result.album.items[0].description).toEqual('Desc') // Description
      expect(result.album.items[0].title).toEqual('City') // Title
      expect(result.album.items[0].thumbPath).toEqual('/galleries/demo/media/thumbs/2016/2016-Image-Filename.jpg') // Thumb Path
      expect(result.album.items[0].photoPath).toEqual('/galleries/demo/media/photos/2016/2016-Image-Filename.jpg') // Photo Path
      expect(result.album.items[0].mediaPath).toEqual('/galleries/demo/media/photos/2016/2016-Image-Filename.jpg') // Photo Path
      expect(result.album.items[0].reference).toBeNull()
      expect(result.album.items[0].coordinates).toBeNull()
      expect(result.album.items[1].coordinates[0]).toEqual(-543.21)
      expect(result.album.items[1].coordinates[1]).toEqual(123)
      expect(result.album.items[0].coordinateAccuracy).toBeNull()
      expect(result.album.items[1].coordinateAccuracy).toEqual(15)
      expect(result.album.items[1].caption).toEqual('Video: Caption') // Video Thumb Caption
      expect(result.album.items[1].photoPath).toEqual('/galleries/demo/media/photos/2016/2016-Video-Filename.jpg') // Photo Path
      expect(result.album.items[1].mediaPath).toEqual('/galleries/demo/media/videos/2016/2016-Video-Filename.mov') // Video Path
      expect(result.album.items[1].reference[0]).toEqual('https://en.wikipedia.org/wiki/Purshia_tridentata') // Wikipedia reference URL
      expect(result.album.items[1].reference[1]).toEqual('Purshia_tridentata') // Wikipedia reference name
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
      const actual = reference(mock)
      expect(actual[0]).toBe('https://www.youtube.com/watch?v=vancouver')
      expect(actual[1]).toBe('vancouver')
    })
    test('Wiki', () => {
      const mock = {
        ref: {
          name: 'Purshia_tridentata',
          source: 'wikipedia',
        },
      }
      const actual = reference(mock)
      expect(actual[0]).toBe('https://en.wikipedia.org/wiki/Purshia_tridentata')
      expect(actual[1]).toBe('Purshia_tridentata')
    })
  })
})
