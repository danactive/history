import { transformMapOptions, transformSourceOptions } from '../options'

describe('Options - <SlippyMap />', () => {
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
      const received = transformSourceOptions({ items })
      const features = [
        {
          geometry: { coordinates: [123, 321], type: 'Point' },
          properties: { accuracy: undefined },
          type: 'Feature',
        },
        {
          geometry: { coordinates: [321, 123], type: 'Point' },
          properties: { accuracy: 10 },
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
          properties: { accuracy: 10 },
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

    test('EmptyNull', () => {
      const received = transformMapOptions({ coordinates: null })
      const expected = {}
      expect(received).toEqual(expected)
    })
  })
})
