import { describe, expect, test, vi } from 'vitest'

import { type Item } from '../../../types/common'
import {
  transformMapOptions,
  transformSourceOptions,
  validatePoint,
} from '../options'
import { getUnclusterPointLayer } from '../layers'
import { generateClusters } from '../../../lib/generate-clusters'
import type { ClusteredMarkers } from '../../../lib/generate-clusters'

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

    test('cluster output is independent of rendering time', () => {
      const items: Item[] = [{ ...mockItem, coordinates: [-123.1, 49.3] }]
      vi.useFakeTimers()
      try {
        vi.setSystemTime(new Date('2026-01-01T00:00:00Z'))
        const first = generateClusters(items)
        vi.setSystemTime(new Date('2026-07-01T00:00:00Z'))
        expect(generateClusters(items)).toEqual(first)
        expect(Object.keys(first.labels)).toHaveLength(1)
      } finally { vi.useRealTimers() }
    })

    test('All Valid coordinates', () => {
      const items: Item[] = [
        { ...mockItem, coordinates: [123, 321] },
        { ...mockItem, coordinates: [321, 123], coordinateAccuracy: 10 },
      ]
      // Generate H3-based clusters
      const clusteredMarkers: ClusteredMarkers = generateClusters(items)
      const received = transformSourceOptions({ items, clusteredMarkers })

      const features = [
        {
          geometry: { coordinates: [123, 321], type: 'Point' },
          properties: { selectionKey: '123:321', label: 'Canada', commonLabel: 'Canada' },
          type: 'Feature',
        },
        {
          geometry: { coordinates: [321, 123], type: 'Point' },
          properties: { selectionKey: '321:123', label: 'Canada', commonLabel: 'Canada' },
          type: 'Feature',
        },
      ]
      const expected = {
        type: 'geojson',
        data: { type: 'FeatureCollection', features },
        cluster: true,
        clusterMaxZoom: 17,
        clusterRadius: 50,
        clusterProperties: {
          commonLabel: [
            'coalesce',
            ['get', 'commonLabel'],
            'Unknown',
          ],
        },
      }
      expect(received).toEqual(expected)
    })

    test('styles selection only when the feature is unclustered', () => {
      const layer = getUnclusterPointLayer('selected-photo')

      expect(layer.filter).toEqual(['!', ['has', 'point_count']])
      expect(layer.paint).toEqual(expect.objectContaining({
        'circle-color': [
          'case',
          ['==', ['get', 'selectionKey'], 'selected-photo'],
          '#FFFFFF',
          '#FFCCCB',
        ],
        'circle-stroke-width': [
          'case',
          ['==', ['get', 'selectionKey'], 'selected-photo'],
          4,
          2,
        ],
      }))
    })

    test('Mix Valid or Invalid coordinates', () => {
      const items: Item[] = [
        { ...mockItem, filename: '123.jpg' },
        { ...mockItem, coordinates: null },
        { ...mockItem, coordinates: [321, 123], coordinateAccuracy: 10 },
      ]
      // Generate H3-based clusters
      const clusteredMarkers: ClusteredMarkers = generateClusters(items)
      const received = transformSourceOptions({
        items,
        clusteredMarkers,
      })

      const features = [
        {
          geometry: { coordinates: [321, 123], type: 'Point' },
          properties: { selectionKey: '321:123', label: 'Canada', commonLabel: 'Canada' },
          type: 'Feature',
        },
      ]
      const expected = {
        type: 'geojson',
        data: { type: 'FeatureCollection', features },
        cluster: true,
        clusterMaxZoom: 17,
        clusterRadius: 50,
        clusterProperties: {
          commonLabel: [
            'coalesce',
            ['get', 'commonLabel'],
            'Unknown',
          ],
        },
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
