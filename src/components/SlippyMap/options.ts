import type { GeoJSONSourceSpecification, LayerProps, ViewState } from 'react-map-gl/mapbox'
import type { Feature, FeatureCollection } from 'geojson'

import config from '../../../src/models/config'

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

// Helper: Calculate most common label for items within proximity
function calculateMostClusterLabels(items: Item[]): Map<string, string> {
  // Group items by approximate location (round coordinates)
  const grouped = items.reduce((acc, item) => {
    const { latitude, longitude, isInvalidPoint } = validatePoint(item.coordinates)
    if (isInvalidPoint) return acc

    // Round to ~2.5km grid for grouping
    const key = `${Math.round(latitude * 40) / 40},${Math.round(longitude * 40) / 40}`
    if (!acc[key]) acc[key] = []
    acc[key].push(item)
    return acc
  }, {} as Record<string, Item[]>)

  // For each group, find most common label
  const labelMap = new Map<string, string>()
  Object.values(grouped).forEach(group => {
    const labelCounts: Record<string, number> = {}
    group.forEach(item => {
      const label = item.location || item.caption
      if (label) labelCounts[label] = (labelCounts[label] || 0) + 1
    })

    const mostCommon = Object.entries(labelCounts)
      .sort(([, a], [, b]) => b - a)[0]?.[0] || 'Unknown'  // Fallback to 'Unknown'

    // Assign most common label to all items in group
    group.forEach(item => {
      const coords = `${item.coordinates?.[0]},${item.coordinates?.[1]}`
      labelMap.set(coords, mostCommon)
    })
  })

  return labelMap
}

interface SelectedFeature extends Feature {
  properties: {
    selected?: boolean
    label: string
    commonLabel: string
  }
}

export function transformSourceOptions(
  { items = [], selected }:
  { items?: Item[], selected: ItemWithCoordinate },
): GeoJSONSourceSpecification {
  const clusterLabels = calculateMostClusterLabels(items)

  const geoJsonFeature = (item: Item): SelectedFeature => {
    const { latitude, longitude } = validatePoint(item.coordinates)
    const { latitude: selectedLatitude, longitude: selectedLongitude } = validatePoint(selected.coordinates)

    const coordKey = item.coordinates?.join(',') || ''
    const commonLabel = clusterLabels.get(coordKey) || 'Unknown'

    const point: SelectedFeature = {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [longitude, latitude],
      },
      properties: {
        label: item.location || item.caption,
        commonLabel,
      },
    }

    if (selectedLatitude === latitude && selectedLongitude === longitude) {
      point.properties.selected = true
    }

    return point
  }

  const hasGeo = (item: Item) => !validatePoint(item?.coordinates).isInvalidPoint
  const features = items.filter(hasGeo).map(geoJsonFeature)

  const data: FeatureCollection = {
    type: 'FeatureCollection',
    features,
  }

  return {
    type: 'geojson',
    data,
    cluster: true,
    clusterMaxZoom: 16,
    clusterRadius: 50,
    clusterProperties: {
      // This aggregates commonLabel from all features in the cluster
      // Since they're all the same (pre-calculated), any will work
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
