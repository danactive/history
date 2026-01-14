import { latLngToCell } from 'h3-js'
import type { Item } from '../types/common'
import type { ResolutionKey } from '../components/SlippyMap/options'

export type ClusteredMarkers = {
  labels: Record<string, Record<ResolutionKey, string>>
  itemFrequency: Record<string, number>
  generatedAt: string
  itemCount: number
}

const UNKNOWN = 'Unknown'

// GeoJSON order: [lng, lat]
const validatePoint = (coordinates?: [number, number] | null) => {
  const [lng, lat] = coordinates ?? [0, 0]
  const isInvalid =
    lng === 0
    || lat === 0
    || Number.isNaN(lat)
    || Number.isNaN(lng)
  return { lng, lat, isInvalid }
}

const RESOLUTION_TO_H3: Record<ResolutionKey, number> = {
  '100m': 13,
  '300m': 11,
  '1.5km': 8,
  '5km': 6,
  '10km': 5,
}

export const BASE_H3_RESOLUTION = RESOLUTION_TO_H3['100m'] // stable key space

function getH3Index(lat: number, lng: number, resolution: number): string {
  return latLngToCell(lat, lng, resolution)
}

export function getLabelForResolution(item: Item, resolution: ResolutionKey): string {
  // Helper: reduce multi-part city to last two segments (e.g. "Building, City, Province, Country" -> "Province, Country")
  const processedCity = (() => {
    const raw = item.city || ''
    const parts = raw.split(',').map(p => p.trim()).filter(p => p.length)
    if (parts.length >= 2) {
      const lastTwo = parts.slice(-2)
      return lastTwo.join(', ')
    }
    return raw
  })()

  if (resolution === '10km' || resolution === '5km') {
    return processedCity
  }
  if (resolution === '1.5km') {
    return item.location || processedCity
  }
  return item.location || item.caption
}

/**
 * Precompute cluster labels and item frequency per baseKey (H3 index) for all resolutions.
 * Returns a compact object suitable to pass to SlippyMap.transformSourceOptions as precomputedLabels.
 */
export function generateClusters(items: Item[]): ClusteredMarkers {
  const labels = {} as Record<string, Record<ResolutionKey, string>>
  const itemFrequency = {} as Record<string, number>

  // Pre-register base keys for all valid items
  for (const it of items) {
    const { lat, lng, isInvalid } = validatePoint(it.coordinates as any)
    if (isInvalid) continue
    const baseKey = getH3Index(lat, lng, BASE_H3_RESOLUTION)
    if (!labels[baseKey]) labels[baseKey] = {} as Record<ResolutionKey, string>
    if (itemFrequency[baseKey] == null) itemFrequency[baseKey] = 0
  }

  // For each resolution, group and compute most common label, then map back to baseKey
  (Object.entries(RESOLUTION_TO_H3) as [ResolutionKey, number][])
    .forEach(([resKey, h3Res]) => {
      const grouped: Record<string, Item[]> = {}

      // Group items by H3 cell at this resolution
      for (const it of items) {
        const { lat, lng, isInvalid } = validatePoint(it.coordinates as any)
        if (isInvalid) continue
        const gridKey = getH3Index(lat, lng, h3Res)
        if (!grouped[gridKey]) grouped[gridKey] = []
        grouped[gridKey].push(it)
      }

      // For each grid, compute most common label; attach to all items in that grid under their baseKey
      Object.values(grouped).forEach((group) => {
        const counts: Record<string, number> = {}
        for (const it of group) {
          const lbl = getLabelForResolution(it, resKey)
          if (lbl && lbl !== UNKNOWN) counts[lbl] = (counts[lbl] || 0) + 1
        }
        const mostCommon =
          Object.entries(counts).sort(([, a], [, b]) => b - a)[0]?.[0]
          || getLabelForResolution(group[0], resKey)

        // Map label to each item's baseKey and track max frequency
        const frequency = group.length
        for (const it of group) {
          const { lat, lng } = validatePoint(it.coordinates as any)
          const baseKey = getH3Index(lat, lng, BASE_H3_RESOLUTION)
          if (!labels[baseKey]) labels[baseKey] = {} as Record<ResolutionKey, string>
          labels[baseKey][resKey] = mostCommon
          itemFrequency[baseKey] = Math.max(itemFrequency[baseKey] || 0, frequency)
        }
      })
    })

  return {
    labels,
    itemFrequency,
    generatedAt: new Date().toISOString(),
    itemCount: items.length,
  }
}
