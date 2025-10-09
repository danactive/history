'use client'
import { useCallback, useMemo, useRef, useState } from 'react'
import type ReactImageGallery from 'react-image-gallery'
import useMemory from '../hooks/useMemory'
import useSearch from '../hooks/useSearch'
import type { All } from '../types/pages'

export default function useMapFilter({ items, indexedKeywords }: All.ComponentProps) {
  const refImageGallery = useRef<ReactImageGallery>(null)
  const [memoryIndex, setMemoryIndex] = useState(0)

  const {
    filtered,
    keyword,
    searchBox,
  } = useSearch({ items, setMemoryIndex, indexedKeywords })

  const { setViewed, memoryHtml } = useMemory(filtered, refImageGallery)

  const [mapFilterEnabled, setMapFilterEnabled] = useState(false)
  const [mapBounds, setMapBounds] = useState<[[number, number],[number, number]] | null>(null)

  const handleToggleMapFilter = useCallback(() => {
    setMapFilterEnabled((prev) => {
      const next = !prev
      if (prev) setMapBounds(null) // clearing bounds when turning off
      return next
    })
  }, [])

  const handleBoundsChange = useCallback((bounds: [[number, number],[number, number]]) => {
    setMapBounds(bounds)
  }, [])

  const itemsToShow = useMemo(() => {
    if (!mapFilterEnabled || !mapBounds) return filtered

    const [[swLng, swLat], [neLng, neLat]] = mapBounds
    return filtered.filter((it) => {
      const coords = it.coordinates ?? [0, 0]
      const [lng, lat] = coords
      const inLng = lng >= swLng && lng <= neLng
      const inLat = lat >= swLat && lat <= neLat
      return inLng && inLat
    })
  }, [mapFilterEnabled, mapBounds, filtered])

  return {
    // UI / interaction
    refImageGallery,
    memoryIndex,
    setMemoryIndex,
    setViewed,
    memoryHtml,

    // search state
    filtered,
    keyword,
    searchBox,

    // map filter controls
    mapFilterEnabled,
    handleToggleMapFilter,
    handleBoundsChange,
    itemsToShow,
  }
}
