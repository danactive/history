import { describe, expect, test } from 'vitest'

import type { XmlAlbum, XmlItem } from '../../types/common'
import { transformReference } from '../../utils/reference'
import transformJsonSchema, { transformPersons } from '../album'
import config from '../config'

function makeXmlItem(overrides: Partial<XmlItem> = {}): XmlItem {
  return {
    $: { id: '1' },
    filename: '2023-01-02-03.jpg',
    photoDate: '2023-01-02',
    photoCity: 'City',
    photoLoc: 'Location',
    thumbCaption: 'Caption',
    ...overrides,
  }
}

function makeXmlAlbum(overrides: Partial<XmlAlbum['album']> = {}): XmlAlbum {
  return {
    album: {
      meta: { gallery: config.defaultGallery },
      item: makeXmlItem(),
      ...overrides,
    },
  }
}

function getSingleItem(xmlAlbum: XmlAlbum) {
  const { item } = xmlAlbum.album
  if (!item || Array.isArray(item)) {
    throw new Error('Expected album fixture to have a single item')
  }
  return item
}

function getMeta(xmlAlbum: XmlAlbum) {
  const { meta } = xmlAlbum.album
  if (!meta) {
    throw new Error('Expected album fixture to have meta')
  }
  return meta
}

describe('Album library', () => {
  describe('transformJsonSchema', () => {
    test('Meta', () => {
      const mock: XmlAlbum = { album: { meta: { gallery: config.defaultGallery } } }
      const expected = { gallery: config.defaultGallery, geo: { zoom: config.defaultZoom } }
      const result = transformJsonSchema(mock, [])
      expect(result.album.meta).toEqual(expected)
      expect(result.album.items.length).toEqual(0)
    })

    test('Only one photo', () => {
      const mock: XmlAlbum = {
        album: {
          meta: { gallery: config.defaultGallery },
          item: {
            $: { id: '1' },
            filename: '2023-01-02-03.jpg',
            photoDate: '2023-01-02',
            photoCity: 'City',
            photoLoc: 'Location',
            thumbCaption: 'Caption',
          },
        },
      }
      const expected = { gallery: config.defaultGallery, geo: { zoom: config.defaultZoom } }
      const result = transformJsonSchema(mock, [])
      expect(result.album.meta).toEqual(expected)
      if (Array.isArray(mock.album.item)) {
        expect(mock.album.item).toHaveLength(0)
      } else {
        expect(result.album.items[0].id).toEqual(mock.album.item?.$.id)
      }
    })

    test('Raw items', () => {
      const expectedMeta = { gallery: config.defaultGallery, geo: { zoom: 10 } }
      const expectFilenamePhoto = '2016-Image-Filename.jpg'
      const expectFilenameVideo1 = '2016-Video-Filename.mov'
      const expectFilenameVideo2 = '2016-Video-Filename.mov'
      const mock: XmlAlbum = {
        album: {
          meta: { gallery: config.defaultGallery, markerZoom: '10' },
          item: [
            {
              $: { id: '1' },
              filename: expectFilenamePhoto,
              photoDate: '2016-01-01',
              photoLoc: 'Location',
              photoCity: 'City',
              thumbCaption: 'Caption',
            },
            {
              $: { id: '2' },
              type: 'video',
              filename: [expectFilenameVideo1, expectFilenameVideo2],
              photoDate: '2016-01-01',
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

    test('uses default zoom when markerZoom is zero or NaN', () => {
      const zeroZoom = transformJsonSchema(makeXmlAlbum({ meta: { gallery: config.defaultGallery, markerZoom: '0' } }), [])
      const nanZoom = transformJsonSchema(makeXmlAlbum({ meta: { gallery: config.defaultGallery, markerZoom: 'abc' } }), [])

      expect(zeroZoom.album.meta.geo?.zoom).toBe(config.defaultZoom)
      expect(nanZoom.album.meta.geo?.zoom).toBe(config.defaultZoom)
    })

    test('falls back to filename when caption is blank', () => {
      const mock = makeXmlAlbum({
        item: makeXmlItem({ thumbCaption: '' }),
      })

      const result = transformJsonSchema(mock, [])
      expect(result.album.items[0].caption).toBe('2023-01-02-03.jpg')
    })

    test('builds title from location only, city only, or neither', () => {
      const locationOnly = transformJsonSchema(makeXmlAlbum({ item: makeXmlItem({ photoLoc: 'Lookout', photoCity: '' }) }), [])
      const cityOnly = transformJsonSchema(makeXmlAlbum({ item: makeXmlItem({ photoLoc: '', photoCity: 'Vancouver' }) }), [])
      const untitled = transformJsonSchema(makeXmlAlbum({ item: makeXmlItem({ photoLoc: '', photoCity: '' }) }), [])

      expect(locationOnly.album.items[0].title).toBe('Lookout')
      expect(cityOnly.album.items[0].title).toBe('Vancouver')
      expect(untitled.album.items[0].title).toBe('Untitled')
    })

    test('allows missing photoCity and defaults it to an empty string', () => {
      const mock = makeXmlAlbum({ item: makeXmlItem({ photoCity: undefined, photoLoc: '' }) })

      const result = transformJsonSchema(mock, [])
      expect(result.album.items[0].city).toBe('')
      expect(result.album.items[0].title).toBe('Untitled')
    })

    test('keeps valid zero coordinates', () => {
      const mock = makeXmlAlbum({
        item: makeXmlItem({
          geo: {
            lat: '0',
            lon: '0',
            accuracy: '12',
          },
        }),
      })

      const result = transformJsonSchema(mock, [])
      expect(result.album.items[0].coordinates).toEqual([0, 0])
      expect(result.album.items[0].coordinateAccuracy).toBe(12)
    })

    test('normalizes zero and NaN coordinate accuracy to null', () => {
      const zeroAccuracy = transformJsonSchema(makeXmlAlbum({
        item: makeXmlItem({
          geo: { lat: '1', lon: '2', accuracy: '0' },
        }),
      }), [])
      const nanAccuracy = transformJsonSchema(makeXmlAlbum({
        item: makeXmlItem({
          geo: { lat: '1', lon: '2', accuracy: 'NaN' },
        }),
      }), [])

      expect(zeroAccuracy.album.items[0].coordinateAccuracy).toBeNull()
      expect(nanAccuracy.album.items[0].coordinateAccuracy).toBeNull()
    })

    test('allows missing geo accuracy and defaults coordinate accuracy to null', () => {
      const result = transformJsonSchema(makeXmlAlbum({
        item: makeXmlItem({
          geo: {
            lat: '1',
            lon: '2',
            accuracy: '',
          },
        }),
      }), [])

      expect(result.album.items[0].coordinates).toEqual([2, 1])
      expect(result.album.items[0].coordinateAccuracy).toBeNull()
    })

    test('throws when duplicate photo_desc elements are present', () => {
      const mock = makeXmlAlbum({
        item: makeXmlItem({
          photoDesc: 'First description',
        }),
      })
      Reflect.set(getSingleItem(mock), 'photoDesc', ['First description', 'Second description'])

      expect(() => transformJsonSchema(mock, [])).toThrow(
        'XML validation failed in <item id="1" filename="2023-01-02-03.jpg" /> element: photoDesc: Invalid input: expected string, received array',
      )
    })

    test('throws when root album element is missing', () => {
      expect(() => transformJsonSchema({}, [])).toThrow('XML is missing <album> element in parent root element')
    })

    test('throws when meta element is missing', () => {
      expect(() => transformJsonSchema({ album: {} }, [])).toThrow('XML is missing <meta> element in parent <album> element')
    })

    test('throws when gallery is missing in meta', () => {
      expect(() => transformJsonSchema({ album: { meta: {}, item: makeXmlItem() } }, [])).toThrow(
        'XML is missing <gallery> element in parent <meta> element',
      )
    })

    test('throws a specific gallery validation error when gallery is invalid', () => {
      const mock = makeXmlAlbum({
        item: makeXmlItem(),
      })
      Reflect.set(getMeta(mock), 'gallery', 'nope')

      expect(() => transformJsonSchema(mock, [])).toThrow(
        'XML validation failed in <meta> element: gallery: Invalid option: expected one of "dan"|"demo"',
      )
    })

    test('throws when item id attribute is missing or blank', () => {
      expect(() => transformJsonSchema(makeXmlAlbum({ item: makeXmlItem({ $: { id: '' } }) }), [])).toThrow(
        'XML is missing id attribute in <item /> element',
      )
      const mock = makeXmlAlbum({
        item: makeXmlItem(),
      })
      Reflect.set(getSingleItem(mock), '$', undefined)

      expect(() => transformJsonSchema(mock, [])).toThrow(
        'XML is missing id attribute in <item /> element',
      )
    })

    test('throws when filename element is missing', () => {
      const mock = makeXmlAlbum({
        item: makeXmlItem(),
      })
      Reflect.deleteProperty(getSingleItem(mock), 'filename')

      expect(() => transformJsonSchema(mock, [])).toThrow('XML is missing <filename> element in parent <item id="1" /> element')
    })

    test('throws when duplicate item ids are present', () => {
      const duplicate = makeXmlAlbum({
        item: [
          makeXmlItem({ $: { id: 'dup' } }),
          makeXmlItem({ $: { id: 'dup' }, filename: '2023-01-02-04.jpg' }),
        ],
      })

      expect(() => transformJsonSchema(duplicate, [])).toThrow('Duplicate <item id="dup"> found in album')
    })

    test('throws a specific item validation error when reference source is invalid', () => {
      const mock = makeXmlAlbum({
        item: makeXmlItem({
          ref: {
            name: 'Purshia_tridentata',
            source: 'wikipedia',
          },
        }),
      })
      const item = getSingleItem(mock)
      if (!item.ref) {
        throw new Error('Expected album fixture to have a reference')
      }
      Reflect.set(item.ref, 'source', 'bad-source')

      expect(() => transformJsonSchema(mock, [])).toThrow(
        'XML validation failed in <item id="1" filename="2023-01-02-03.jpg" /> element: ref.source: Invalid option',
      )
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

    test('returns null for empty or missing search values', () => {
      expect(transformPersons('', [])).toBeNull()
      expect(transformPersons(undefined, [])).toBeNull()
    })

    test('preserves duplicate matched names from search order', () => {
      const person = {
        ...mockPerson, first: 'British', last: 'Columbia', full: 'British Columbia', display: 'British Columbia',
      }

      const actual = transformPersons('British Columbia, British Columbia', [person])

      expect(actual).toEqual([
        { full: 'British Columbia', dob: '2024-11-12' },
        { full: 'British Columbia', dob: '2024-11-12' },
      ])
    })
  })

  describe('reference', () => {
    const mockItem = {
      $: { id: '1' },
      filename: '2016-Image-Filename.jpg',
      photoDate: '2016-01-01',
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
      const actual = transformReference(mock.ref)
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
      const actual = transformReference(mock.ref)
      if (actual === null) {
        expect(actual).not.toBeNull()
      } else {
        expect(actual[0]).toBe('https://en.wikipedia.org/wiki/Purshia_tridentata')
        expect(actual[1]).toBe('Purshia_tridentata')
      }
    })
  })
})
