import config from '../../../config.json'
import type { XmlAlbum, XmlItem } from '../../types/common'
import transformJsonSchema, { transformPersons, transformReference } from '../album'

describe('Album library', () => {
  describe('transformJsonSchema', () => {
    test('Meta', () => {
      const mock = { album: { meta: { gallery: 'demo' } } }
      const expected = { gallery: 'demo', geo: { zoom: config.defaultZoom } }
      const result = transformJsonSchema(mock, [])
      expect(result.album.meta).toEqual(expected)
      expect(result.album.items.length).toEqual(0)
    })

    test('Only one photo', () => {
      const mock: XmlAlbum = {
        album: {
          meta: { gallery: 'demo' },
          item: {
            $: { id: '1' },
            filename: '2023-01-02-03.jpg',
            photoCity: 'City',
            photoLoc: 'Location',
            thumbCaption: 'Caption',
          },
        },
      }
      const expected = { gallery: 'demo', geo: { zoom: config.defaultZoom } }
      const result = transformJsonSchema(mock, [])
      expect(result.album.meta).toEqual(expected)
      if (Array.isArray(mock.album.item)) {
        expect(mock.album.item).toHaveLength(0)
      } else {
        expect(result.album.items[0].id).toEqual(mock.album.item?.$.id)
      }
    })

    test('Raw items', () => {
      const expectedMeta = { gallery: 'demo', geo: { zoom: 10 } }
      const expectFilenamePhoto = '2016-Image-Filename.jpg'
      const expectFilenameVideo1 = '2016-Video-Filename.mov'
      const expectFilenameVideo2 = '2016-Video-Filename.mov'
      const mock: XmlAlbum = {
        album: {
          meta: { gallery: 'demo', markerZoom: '10' },
          item: [
            {
              $: { id: '1' },
              filename: expectFilenamePhoto,
              photoLoc: 'Location',
              photoCity: 'City',
              thumbCaption: 'Caption',
            },
            {
              $: { id: '2' },
              type: 'video',
              filename: [expectFilenameVideo1, expectFilenameVideo2],
              size: { w: '1280', h: '720' },
              photoLoc: 'Location',
              photoCity: 'City',
              thumbCaption: 'Caption',
              geo: {
                lat: '123',
                lon: '-543.21',
                accuracy: '15',
              },
              ref: {
                name: 'Purshia_tridentata',
                source: 'wikipedia',
              },
            },
          ],
        },
      }
      const result = transformJsonSchema(mock, [])

      expect(result.album.meta).toEqual(expectedMeta) // Meta (w/ Items)
      if (mock.album.item && Array.isArray(mock.album.item)) {
        expect(result.album.items[0].id).toEqual(mock.album.item[0].$.id) // Items (w/ Meta)
      } else {
        expect(mock.album.item).toHaveLength(2)
      }
      expect(result.album.items[0].filename).toEqual(expectFilenamePhoto) // Filename
      expect(result.album.items[0].caption).toEqual('Caption') // Image Caption
      expect(result.album.items[0].city).toEqual('City') // City
      expect(result.album.items[0].location).toEqual('Location') // Location
      expect(result.album.items[0].title).toEqual('Location (City)') // Title
      expect(result.album.items[0].thumbPath).toEqual('/galleries/demo/media/thumbs/2016/2016-Image-Filename.jpg') // Thumb Path
      expect(result.album.items[0].photoPath).toEqual('/galleries/demo/media/photos/2016/2016-Image-Filename.jpg') // Photo Path
      expect(result.album.items[0].mediaPath).toEqual('/galleries/demo/media/photos/2016/2016-Image-Filename.jpg') // Photo Path
      expect(result.album.items[0].reference).toBeNull()
      expect(result.album.items[0].coordinates).toBeNull()
      expect(result.album.items[1].filename).toEqual([expectFilenameVideo1, expectFilenameVideo2]) // Filename
      expect(result.album.items[1].coordinates?.[0]).toEqual(-543.21)
      expect(result.album.items[1].coordinates?.[1]).toEqual(123)
      expect(result.album.items[0].coordinateAccuracy).toBeNull()
      expect(result.album.items[1].coordinateAccuracy).toEqual(15)
      expect(result.album.items[1].caption).toEqual('Video: Caption') // Video Thumb Caption
      expect(result.album.items[1].photoPath).toEqual('/galleries/demo/media/photos/2016/2016-Video-Filename.jpg') // Photo Path
      expect(result.album.items[1].mediaPath).toEqual('/galleries/demo/media/videos/2016/2016-Video-Filename.mov') // Video Path
      expect(result.album.items[1].reference?.[0]).toEqual('https://en.wikipedia.org/wiki/Purshia_tridentata') // Wikipedia reference URL
      expect(result.album.items[1].reference?.[1]).toEqual('Purshia_tridentata') // Wikipedia reference name
    })
  })

  describe('transformPersons', () => {
    const mockPerson = { dob: '2024-11-12' }

    test('0 out of 2 match', () => {
      const samplePerson = 'Manitoba'
      const actual = transformPersons(samplePerson, [{
        ...mockPerson, first: 'British', last: 'Columbia', full: 'British Columbia',
      }])
      expect(actual).toBe(null)
    })

    test('1 out of 1 match', () => {
      const samplePerson = 'British Columbia'
      const actual = transformPersons(samplePerson, [{
        ...mockPerson, first: 'British', last: 'Columbia', full: 'British Columbia',
      }])
      expect(actual?.[0].full).toBe(samplePerson)
    })

    test('1 out of 2 match', () => {
      const samplePerson = 'British Columbia'
      const person1 = {
        ...mockPerson, first: 'Yukon', last: 'Territory', full: 'Yukon Territory', display: 'Yukon Territory',
      }
      const person2 = {
        ...mockPerson, first: 'British', last: 'Columbia', full: 'British Columbia', display: 'British Columbia',
      }
      const actual = transformPersons(samplePerson, [person1, person2])
      expect(actual?.[0].full).toBe(samplePerson)
    })

    test('2 out of 2 match', () => {
      expect.assertions(2)
      const expected = 'British Columbia, Yukon Territory'
      const person1 = {
        ...mockPerson, first: 'British', last: 'Columbia', full: 'British Columbia', display: 'British Columbia',
      }
      const person2 = {
        ...mockPerson, first: 'Yukon', last: 'Territory', full: 'Yukon Territory', display: 'Yukon Territory',
      }
      const person3 = {
        ...mockPerson, first: 'Northwest', last: 'Territories', full: 'Northwest Territories', display: 'Northwest Territories',
      }
      const actuals = transformPersons(expected, [person1, person2, person3])
      expect(actuals).toHaveLength(2)
      if (actuals) {
        expect(actuals.map((actual) => actual.full).join(', ')).toBe(expected)
      }
    })

    test('Person order', () => {
      expect.assertions(2)
      const search = 'British Columbia, Yukon Territory'
      const person1 = {
        ...mockPerson, first: 'British', last: 'Columbia', full: 'British Columbia', display: 'British Columbia',
      }
      const person2 = {
        ...mockPerson, first: 'Yukon', last: 'Territory', full: 'Yukon Territory', display: 'Yukon Territory',
      }
      const person3 = {
        ...mockPerson, first: 'Northwest', last: 'Territories', full: 'Northwest Territories', display: 'Northwest Territories',
      }
      const actuals = transformPersons(search, [person3, person2, person1])
      expect(actuals).toHaveLength(2)
      if (actuals) {
        expect(actuals.map((actual) => actual.full).join(', ')).toBe(search)
      }
    })
  })

  describe('reference', () => {
    const mockItem = {
      $: { id: '1' },
      filename: '2016-Image-Filename.jpg',
      photoLoc: 'Location',
      photoCity: 'City',
      thumbCaption: 'Caption',
    }
    test('YouTube', () => {
      const mock: XmlItem = {
        ...mockItem,
        ref: {
          name: 'vancouver',
          source: 'youtube',
        },
      }
      const actual = transformReference(mock)
      if (actual === null) {
        expect(actual).not.toBeNull()
      } else {
        expect(actual[0]).toBe('https://www.youtube.com/watch?v=vancouver')
        expect(actual[1]).toBe('vancouver')
      }
    })
    test('Wiki', () => {
      const mock: XmlItem = {
        ...mockItem,
        ref: {
          name: 'Purshia_tridentata',
          source: 'wikipedia',
        },
      }
      const actual = transformReference(mock)
      if (actual === null) {
        expect(actual).not.toBeNull()
      } else {
        expect(actual[0]).toBe('https://en.wikipedia.org/wiki/Purshia_tridentata')
        expect(actual[1]).toBe('Purshia_tridentata')
      }
    })
  })
})
