import { transformMapOptions, transformSourceOptions, validatePoint } from '../options'

describe('Options - <SlippyMap />', () => {
  describe('validatePoint', () => {
    test('Empty', () => {
      const received = validatePoint()
      const expected = {
        isInvalidPoint: true,
        latitude: null,
        longitude: null,
      }
      expect(received).toEqual(expected)
    })
  })

  describe('Mapbox Source - transformSourceOptions', () => {
    test('Empty', () => {
      const received = transformSourceOptions()
      const expected = {
        cluster: true, clusterMaxZoom: 13, clusterRadius: 50, data: { features: [], type: 'FeatureCollection' }, type: 'geojson',
      }
      expect(received).toEqual(expected)
    })

    test('All Invalid coordinates', () => {
      const items = [{}, {}]
      const received = transformSourceOptions(items)
      const expected = {
        cluster: true, clusterMaxZoom: 13, clusterRadius: 50, data: { features: [], type: 'FeatureCollection' }, type: 'geojson',
      }
      expect(received).toEqual(expected)
    })

    test('All Valid coordinates', () => {
      const items = [{ coordinates: [123, 321] }, { coordinates: [321, 123], coordinateAccuracy: 10 }]
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
      const items = [{ filename: '123.jpg' }, { coordinates: null }, { coordinates: [321, 123], coordinateAccuracy: 10 }]
      const received = transformSourceOptions({ items })
      const features = [
        {
          geometry: { coordinates: [321, 123], type: 'Point' },
          properties: {},
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
    test('Empty', () => {
      const received = transformMapOptions()
      const expected = {}
      expect(received).toEqual(expected)
    })

    test('Empty Null', () => {
      const received = transformMapOptions({ coordinates: null })
      const expected = {}
      expect(received).toEqual(expected)
    })
  })
})
