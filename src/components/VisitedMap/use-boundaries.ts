import { useEffect, useState } from 'react'
import { mapCountries, type MapCountry, type RegionCollection } from './regions'

export type BoundaryState = Partial<Record<MapCountry, { data?: RegionCollection, error?: boolean }>>
const cache = new Map<MapCountry, RegionCollection>()

export function useBoundaries(enabled = true) {
  const [loaded, setLoaded] = useState<BoundaryState>(() => Object.fromEntries(
    [...cache].map(([country, data]) => [country, { data }]),
  ))
  useEffect(() => {
    if (!enabled) return
    const controller = new AbortController()
    for (const country of Object.keys(mapCountries) as MapCountry[]) {
      if (cache.has(country)) continue
      fetch(`/maps/visited/${mapCountries[country].file}.geojson`, { signal: controller.signal })
        .then(response => {
          if (!response.ok) throw new Error('Could not load boundaries')
          return response.json() as Promise<RegionCollection>
        })
        .then(data => {
          if (controller.signal.aborted) return
          cache.set(country, data)
          setLoaded(current => ({ ...current, [country]: { data } }))
        })
        .catch(() => {
          if (!controller.signal.aborted) setLoaded(current => ({ ...current, [country]: { error: true } }))
        })
    }
    return () => controller.abort()
  }, [enabled])
  return loaded
}
