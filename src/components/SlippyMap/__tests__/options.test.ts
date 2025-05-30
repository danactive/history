import { type Item } from '../../../types/common'
import { transformMapOptions, transformSourceOptions, validatePoint } from '../options'

describe('Options - <SlippyMap />', () => {
  describe('validatePoint', () => {
    test('Empty', () => {
      const received = validatePoint([0, 0])
      const expected = {
        isInvalidPoint: true,
        latitude: 0,
        longitude: 0,
      }
      expect(received).toEqual(expected)
    })
  })

  describe('Mapbox Source - transformSourceOptions', () => {
    const mockItem: Item = {
      id: '0',
      filename: '2023-08-23-00.jpg',
      photoDate: '2023-08-23',
      city: 'North Vancouver',
      location: 'Canada',
      caption: 'Mock caption',
      description: null,
      search: null,
      persons: null,
      title: 'Mock title',
      coordinates: null,
      coordinateAccuracy: null,
      thumbPath: './',
      photoPath: './',
      mediaPath: './',
      videoPaths: './',
      reference: null,
    }

    test('All Valid coordinates', () => {
      const items: Item[] = [
        { ...mockItem, coordinates: [123, 321] },
        { ...mockItem, coordinates: [321, 123], coordinateAccuracy: 10 },
      ]
      const received = transformSourceOptions({ items, selected: items[1] })
      const features = [
        {
          geometry: { coordinates: [123, 321], type: 'Point' },
          properties: {},
          type: 'Feature',
        },
        {
          geometry: { coordinates: [321, 123], type: 'Point' },
          properties: { selected: true },
          type: 'Feature',
        },
      ]
      const expected = {
        cluster: true, clusterMaxZoom: 13, clusterRadius: 50, data: { features, type: 'FeatureCollection' }, type: 'geojson',
      }
      expect(received).toEqual(expected)
    })

    test('Mix Valid or Invalid coordinates', () => {
      const items: Item[] = [
        { ...mockItem, filename: '123.jpg' },
        { ...mockItem, coordinates: null },
        { ...mockItem, coordinates: [321, 123], coordinateAccuracy: 10 },
      ]
      const received = transformSourceOptions({ items, selected: { coordinates: items[2].coordinates } })
      const features = [
        {
          geometry: { coordinates: [321, 123], type: 'Point' },
          properties: {
            selected: true,
          },
          type: 'Feature',
        },
      ]
      const expected = {
        cluster: true, clusterMaxZoom: 13, clusterRadius: 50, data: { features, type: 'FeatureCollection' }, type: 'geojson',
      }
      expect(received).toEqual(expected)
    })
  })

  describe('Mapbox Map - transformMapOptions', () => {
    test('Empty Null', () => {
      const received = transformMapOptions({ coordinates: null })
      const expected = {}
      expect(received).toEqual(expected)
    })
  })
})
