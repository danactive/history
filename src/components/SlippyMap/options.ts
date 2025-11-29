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

interface SelectedFeature extends Feature {
  properties: {
    selected?: boolean
    label: string
    commonLabel: string
  }
}

export type ResolutionKey = '100m' | '300m' | '1.5km' | '5km' | '10km'

type MultiResolutionLabels = {
  labels: Map<string, Map<ResolutionKey, string>>
  itemFrequency: Map<string, number>
}

export function transformSourceOptions(
  { items = [], selected, zoom = 10 }:
  { items?: Item[], selected: ItemWithCoordinate, zoom?: number },
): GeoJSONSourceSpecification {
  const { labels, itemFrequency } = calculateMultiResolutionLabels(items)
  const resolution = getResolutionForZoom(zoom)

  // Get multiplier for current resolution
  const RESOLUTION_TO_METERS: Record<ResolutionKey, number> = {
    '100m': 1000,   // Math.round(lat * 1000) / 1000 ≈ 100m grid
    '300m': 300,    // Math.round(lat * 300) / 300 ≈ 300m grid
    '1.5km': 67,    // Math.round(lat * 67) / 67 ≈ 1.5km grid
    '5km': 20,      // Math.round(lat * 20) / 20 ≈ 5km grid
    '10km': 10,     // Math.round(lat * 10) / 10 ≈ 10km grid
  }
  const multiplier = RESOLUTION_TO_METERS[resolution]

  // Sort items by frequency (most common labels first)
  // This ensures Mapbox's clusterProperties picks the most common label
  const sortedItems = [...items].sort((a, b) => {
    const { latitude: latA, longitude: lngA } = validatePoint(a.coordinates)
    const { latitude: latB, longitude: lngB } = validatePoint(b.coordinates)

    const coordKeyA = `${Math.round(latA * multiplier) / multiplier},${Math.round(lngA * multiplier) / multiplier}`
    const coordKeyB = `${Math.round(latB * multiplier) / multiplier},${Math.round(lngB * multiplier) / multiplier}`

    const freqA = itemFrequency.get(coordKeyA) || 0
    const freqB = itemFrequency.get(coordKeyB) || 0
    return freqB - freqA  // Sort descending (most common first)
  })

  const geoJsonFeature = (item: Item): SelectedFeature => {
    const { latitude, longitude } = validatePoint(item.coordinates)
    const { latitude: selectedLatitude, longitude: selectedLongitude } = validatePoint(selected.coordinates)

    // Get the multiplier for current resolution
    const RESOLUTION_TO_METERS: Record<ResolutionKey, number> = {
      '100m': 1000,
      '300m': 300,
      '1.5km': 67,
      '5km': 20,
      '10km': 10,
    }
    const multiplier = RESOLUTION_TO_METERS[resolution]

    const coordKey = `${Math.round(latitude * multiplier) / multiplier},${Math.round(longitude * multiplier) / multiplier}`
    // Example at 1.5km resolution: "121.50,25.05"

    // Get label for current zoom's resolution
    const commonLabel = labels.get(coordKey)?.get(resolution) || 'Unknown'

    // Use resolution-appropriate label for individual marker too
    const individualLabel = getLabelForResolution(item, resolution)

    const point: SelectedFeature = {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [longitude, latitude],  // Keep exact coords for geometry
      },
      properties: {
        label: individualLabel,  // Changed: was item.location || item.caption
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

/**
 * Get the appropriate label property from an item based on resolution
 * @param {Item} item - The item to extract label from
 * @param {ResolutionKey} resolution - Current map resolution
 * @returns {string} Most appropriate label for the given resolution
 */
function getLabelForResolution(item: Item, resolution: ResolutionKey): string {
  // At far zoom levels (10km, 5km), use broader location info
  if (resolution === '10km' || resolution === '5km') {
    return item.city || item.location || item.caption || 'Unknown'
  }

  // At medium zoom (1.5km), prefer location over city
  if (resolution === '1.5km') {
    return item.location || item.city || item.caption || 'Unknown'
  }

  // At close zoom (300m, 100m), use most specific label available
  return item.location || item.caption || item.city || 'Unknown'
}

/**
 * Calculate most common labels at multiple resolutions
 * Items are sorted by frequency (most common first) for better Mapbox clustering
 */
function calculateMultiResolutionLabels(items: Item[]): MultiResolutionLabels {
  const RESOLUTION_TO_METERS: Record<ResolutionKey, number> = {
    '100m': 1000,
    '300m': 300,
    '1.5km': 67,
    '5km': 20,
    '10km': 10,
  }

  const labels = new Map<string, Map<ResolutionKey, string>>()
  const itemFrequency = new Map<string, number>()

  // Process each resolution
  Object.entries(RESOLUTION_TO_METERS).forEach(([resolution, multiplier]) => {
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
        // Use resolution-appropriate label
        const label = getLabelForResolution(item, resKey)
        if (label && label !== 'Unknown') {
          labelCounts[label] = (labelCounts[label] || 0) + 1
        }
      })

      const mostCommon = Object.entries(labelCounts)
        .sort(([, a], [, b]) => b - a)[0]?.[0] || 'Unknown'

      // Store how frequent each item's label is in this grid (for sorting)
      group.forEach(item => {
        const { latitude, longitude } = validatePoint(item.coordinates)
        const coordKey = `${Math.round(latitude * multiplier) / multiplier},${Math.round(longitude * multiplier) / multiplier}`

        // Use resolution-appropriate label for frequency counting too
        const itemLabel = getLabelForResolution(item, resKey)
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
