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
  { items = [], selected, zoom = 10 }:
  { items?: Item[], selected: ItemWithCoordinate, zoom?: number },
): GeoJSONSourceSpecification {
  const { labels, itemFrequency } = calculateMultiResolutionLabels(items)
  const resolution = getResolutionForZoom(zoom)

  // Sort items by frequency (most common labels first)
  // This ensures Mapbox's clusterProperties picks the most common label
  const sortedItems = [...items].sort((a, b) => {
    const coordKeyA = a.coordinates?.join(',') || ''
    const coordKeyB = b.coordinates?.join(',') || ''
    const freqA = itemFrequency.get(coordKeyA) || 0
    const freqB = itemFrequency.get(coordKeyB) || 0
    return freqB - freqA  // Sort descending (most common first)
  })

  const geoJsonFeature = (item: Item): SelectedFeature => {
    const { latitude, longitude } = validatePoint(item.coordinates)
    const { latitude: selectedLatitude, longitude: selectedLongitude } = validatePoint(selected.coordinates)

    const coordKey = item.coordinates?.join(',') || ''

    // Get label for current zoom's resolution
    const commonLabel = labels.get(coordKey)?.get(resolution) || 'Unknown'

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
  const features = sortedItems.filter(hasGeo).map(geoJsonFeature)  // Use sortedItems

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
      // Now picks from first feature, which is the most common one!
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
 * - Zoom 0-5: Continental/country level (50-100km)
 * - Zoom 6-9: State/region level (10-50km)
 * - Zoom 10-13: City level (1-10km)
 * - Zoom 14-16: Neighborhood level (100m-1km)
 * - Zoom 17+: Street level (<100m)
 */
function getResolutionForZoom(zoom: number): ResolutionKey {
  if (zoom >= 14) return '500m'   // Neighborhood/street level
  if (zoom >= 10) return '2km'    // City/district level
  if (zoom >= 6) return '10km'    // Regional level
  return '50km'                    // Country/continental level
}

type ResolutionKey = '500m' | '2km' | '10km' | '50km'

type MultiResolutionLabels = {
  labels: Map<string, Map<ResolutionKey, string>>;
  itemFrequency: Map<string, number>;
}

/**
 * Calculate most common labels at multiple resolutions
 * Items are sorted by frequency (most common first) for better Mapbox clustering
 */
function calculateMultiResolutionLabels(items: Item[]): MultiResolutionLabels {
  const resolutions: Record<ResolutionKey, number> = {
    '500m': 200,   // Math.round(lat * 200) / 200 ≈ 500m grid
    '2km': 50,     // Math.round(lat * 50) / 50 ≈ 2km grid
    '10km': 10,    // Math.round(lat * 10) / 10 ≈ 10km grid
    '50km': 2,     // Math.round(lat * 2) / 2 ≈ 50km grid
  }

  const labels = new Map<string, Map<ResolutionKey, string>>()
  const itemFrequency = new Map<string, number>()

  // Process each resolution
  Object.entries(resolutions).forEach(([resolution, multiplier]) => {
    const resKey = resolution as ResolutionKey

    // Group items by this resolution's grid
    const grouped = items.reduce((acc, item) => {
      const { latitude, longitude, isInvalidPoint } = validatePoint(item.coordinates)
      if (isInvalidPoint) return acc

      const gridKey = `${Math.round(latitude * multiplier) / multiplier},${Math.round(longitude * multiplier) / multiplier}`
      if (!acc[gridKey]) acc[gridKey] = []
      acc[gridKey].push(item)
      return acc
    }, {} as Record<string, Item[]>)

    // For each grid cell, find most common label
    Object.entries(grouped).forEach(([gridKey, group]) => {
      const labelCounts: Record<string, number> = {}
      group.forEach(item => {
        const label = item.location || item.caption
        if (label) labelCounts[label] = (labelCounts[label] || 0) + 1
      })

      const mostCommon = Object.entries(labelCounts)
        .sort(([, a], [, b]) => b - a)[0]?.[0] || 'Unknown'

      // Store how frequent each item's label is in this grid (for sorting)
      group.forEach(item => {
        const coordKey = `${item.coordinates?.[0]},${item.coordinates?.[1]}`
        const itemLabel = item.location || item.caption || 'Unknown'
        const frequency = labelCounts[itemLabel] || 0

        // Track max frequency across all resolutions
        const currentFreq = itemFrequency.get(coordKey) || 0
        if (frequency > currentFreq) {
          itemFrequency.set(coordKey, frequency)
        }

        // Initialize map if needed
        if (!labels.has(coordKey)) {
          labels.set(coordKey, new Map<ResolutionKey, string>())
        }

        // Store label for this resolution
        labels.get(coordKey)!.set(resKey, mostCommon)
      })
    })
  })

  return { labels, itemFrequency }
}
