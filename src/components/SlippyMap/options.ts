import { latLngToCell } from 'h3-js'
import type { Feature, FeatureCollection } from 'geojson'
import type { GeoJSONSourceSpecification, LayerProps, ViewState } from 'react-map-gl/mapbox'

import config from '../../../src/models/config'
import { type ClusteredMarkers, BASE_H3_RESOLUTION, generateClusters, getLabelForResolution } from '../../lib/generate-clusters'
import type { Item } from '../../types/common'

export const validatePoint = (
  coordinates:
  Item['coordinates'],
) => {
  const [longitude, latitude] = coordinates ?? [0, 0]
  return {
    latitude,
    longitude,
    isInvalidPoint:
      longitude === 0
      || latitude === 0
      || Number.isNaN(latitude)
      || Number.isNaN(longitude),
  }
}

type ItemWithCoordinate = {
  coordinates: Item['coordinates']
}

interface SelectedFeature extends Feature {
  properties: {
    selected?: boolean
    label: string
    commonLabel: string
  }
}

export type ResolutionKey = '100m' | '300m' | '1.5km' | '5km' | '10km'

export function transformSourceOptions(
  { items = [], selected, zoom = 10, clusteredMarkers }:
  {
    clusteredMarkers: ClusteredMarkers,
    items?: Item[],
    selected: ItemWithCoordinate,
    zoom?: number,
  },
): GeoJSONSourceSpecification {
  const resolution = getResolutionForZoom(zoom)

  // Use server/client precomputed if provided, else compute locally
  const computed = clusteredMarkers ?? generateClusters(items)

  // Sort items by precomputed frequency (desc)
  const sortedItems = [...items].sort((a, b) => {
    const { latitude: latA, longitude: lngA } = validatePoint(a.coordinates)
    const { latitude: latB, longitude: lngB } = validatePoint(b.coordinates)
    const keyA = latLngToCell(latA, lngA, BASE_H3_RESOLUTION)
    const keyB = latLngToCell(latB, lngB, BASE_H3_RESOLUTION)
    const freqA = computed.itemFrequency[keyA] || 0
    const freqB = computed.itemFrequency[keyB] || 0
    return freqB - freqA
  })

  const geoJsonFeature = (item: Item): SelectedFeature => {
    const { latitude, longitude } = validatePoint(item.coordinates)
    const { latitude: selectedLatitude, longitude: selectedLongitude } = validatePoint(selected.coordinates)

    const baseKey = latLngToCell(latitude, longitude, BASE_H3_RESOLUTION)
    const commonLabel = computed.labels[baseKey]?.[resolution] || getLabelForResolution(item, resolution)
    const individualLabel = getLabelForResolution(item, resolution)

    const point: SelectedFeature = {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [longitude, latitude] },
      properties: {
        label: individualLabel,
        commonLabel,
      },
    }

    if (selectedLatitude === latitude && selectedLongitude === longitude) {
      point.properties.selected = true
    }
    return point
  }

  const hasGeo = (item: Item) => !validatePoint(item?.coordinates).isInvalidPoint
  const features = sortedItems.filter(hasGeo).map(geoJsonFeature)

  const data: FeatureCollection = {
    type: 'FeatureCollection',
    features,
  }

  return {
    type: 'geojson',
    data,
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
}

export function transformMapOptions(
  { coordinates, zoom = config.defaultZoom } :
  { coordinates: Item['coordinates'], zoom?: number },
): ViewState | {} {
  if (coordinates === null) return {}
  const { isInvalidPoint, latitude, longitude } = validatePoint(coordinates)

  const options = {} as ViewState
  if (!isInvalidPoint) {
    options.latitude = latitude
    options.longitude = longitude
    options.zoom = zoom
    options.bearing = 0
    options.pitch = 0
  }

  return options
}

export function transformInaccurateMarkerOptions(coordinateAccuracy: Item['coordinateAccuracy']): LayerProps {
  const radius = (coordinateAccuracy ?? 0) * 5

  return {
    id: 'inaccurate-marker',
    type: 'circle',
    paint: {
      'circle-radius': radius,
      'circle-stroke-width': 2,
      'circle-blur': 0.4,
      'circle-stroke-color': '#FFFFFF',
      'circle-stroke-opacity': 0.85,
      'circle-opacity': 0,
    },
    filter: ['has', 'accuracy'],
  }
}

/**
 * Select appropriate clustering resolution based on zoom level
 * Using industry-standard zoom level practices:
 * - Zoom 0-5: Country/region level (10km)
 * - Zoom 6-9: State/province level (5km)
 * - Zoom 10-13: City level (1.5km)
 * - Zoom 14-16: Neighborhood level (300m)
 * - Zoom 17+: Street level (100m)
 */
export function getResolutionForZoom(zoom: number): ResolutionKey {
  if (zoom >= 17) return '100m'     // street level - very precise
  if (zoom >= 14) return '300m'     // neighborhood level
  if (zoom >= 10) return '1.5km'    // city level
  if (zoom >= 6)  return '5km'      // province/state level
  return '10km'                     // country/region level
}
