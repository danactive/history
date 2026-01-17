'use client'
import { useCallback, useEffect, useMemo, useRef, useState, type Dispatch, type SetStateAction } from 'react'
import type ReactImageGallery from 'react-image-gallery'
import type { All } from '../types/pages'
import useMemory from './useMemory'
import useSearch from './useSearch'

type Bounds = [[number, number],[number, number]]

export default function useMapFilter({ items, indexedKeywords }: All.ItemData) {
  const refImageGallery = useRef<ReactImageGallery>(null)
  const [memoryIndex, setMemoryIndexState] = useState(0)
  const resetIndexOnEnableRef = useRef(false) // flag to force index 0 when enabling map filter
  const autoInitialViewRef = useRef(true) // controls useMemory auto mark
  const [isClearing, setIsClearing] = useState(false) // flag to prevent map updates during clear

  const setMemoryIndex: Dispatch<SetStateAction<number>> = useCallback((value) => {
    setMemoryIndexState(prev => {
      const next = typeof value === 'function' ? value(prev) : value
      return prev === next ? prev : next
    })
  }, [])

  const [mapFilterEnabled, setMapFilterEnabled] = useState(false)
  const [mapBounds, setMapBounds] = useState<Bounds | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [clearCoordinates, setClearCoordinates] = useState<[number, number] | null>(null)

  const handleClearMapFilter = useCallback((coordinates?: [number, number] | null) => {
    // Preserve coordinates before clearing filter
    if (coordinates) {
      setClearCoordinates(coordinates)
    }
    setIsClearing(true)
    setMapFilterEnabled(false)
    setMapBounds(null)
  }, [])

  const selectById = useCallback((id: string, isClear = false) => {
    // Simply update selectedId for both clear and normal operations
    // The URL-based handling in each client will position the gallery
    setSelectedId(prev => (prev === id ? prev : id))
  }, [])

  const {
    filtered,
    keyword,
    searchBox,
    setVisibleCount,
    setDisplayedItems,
  } = useSearch({
    items,
    setMemoryIndex,
    indexedKeywords,
    refImageGallery,
    mapFilterEnabled,
    onClearMapFilter: handleClearMapFilter,
    selectById,
  })

  const handleBoundsChange = useCallback((bounds: Bounds) => {
    if (!bounds) return
    setMapBounds(prev => {
      if (
        prev &&
        prev[0][0] === bounds[0][0] &&
        prev[0][1] === bounds[0][1] &&
        prev[1][0] === bounds[1][0] &&
        prev[1][1] === bounds[1][1]
      ) return prev
      return bounds
    })
  }, [])

  const itemsToShow = useMemo(() => {
    if (!mapFilterEnabled || !mapBounds) return filtered
    const [[swLng, swLat], [neLng, neLat]] = mapBounds
    return filtered.filter(it => {
      const coords = it.coordinates as [number, number] | undefined
      if (!coords) return false
      const [lng, lat] = coords
      return lng >= swLng && lng <= neLng && lat >= swLat && lat <= neLat
    })
  }, [mapFilterEnabled, mapBounds, filtered])

  // Memoized ID-to-index maps for O(1) lookups (critical for large datasets)
  const itemsToShowMap = useMemo(() => {
    const map = new Map<string, number>()
    itemsToShow.forEach((item: any, idx) => {
      // Index by ID
      if (item.id) map.set(item.id, idx)
      // Also index by filename (globally unique)
      const filename = Array.isArray(item.filename) ? item.filename[0] : item.filename
      if (filename) map.set(filename, idx)
    })
    return map
  }, [itemsToShow])

  const filteredMap = useMemo(() => {
    const map = new Map<string, number>()
    filtered.forEach((item: any, idx) => {
      // Index by ID
      if (item.id) map.set(item.id, idx)
      // Also index by filename (globally unique)
      const filename = Array.isArray(item.filename) ? item.filename[0] : item.filename
      if (filename) map.set(filename, idx)
    })
    return map
  }, [filtered])

  // Update displayed items whenever itemsToShow changes
  useEffect(() => {
    setDisplayedItems(itemsToShow)
  }, [itemsToShow, setDisplayedItems])

  // Pass suppression flag to useMemory
  const { setViewed, memoryHtml, viewedList } = useMemory(
    itemsToShow,
    refImageGallery,
    { autoInitialView: autoInitialViewRef.current },
  )

  const handleToggleMapFilter = useCallback(() => {
    setMapFilterEnabled(prev => {
      const next = !prev
      if (next) {
        // enabling: suppress auto mark for new filtered list; force index 0 after list settles
        resetIndexOnEnableRef.current = true
        autoInitialViewRef.current = false
      } else {
        // disabling: clear bounds only
        setMapBounds(null)
      }
      return next
    })
  }, [])

  // After map filter enables and itemsToShow recalculates, force memoryIndex 0 and mark viewed
  useEffect(() => {
    if (mapFilterEnabled && resetIndexOnEnableRef.current) {
      // Now itemsToShow is narrowed; mark only index 0
      resetIndexOnEnableRef.current = false
      setMemoryIndexState(0)
      // Move gallery to first item if mounted
      if (refImageGallery.current) {
        refImageGallery.current.slideToIndex(0)
      }
      setViewed(0)
      // Re-enable auto marking for subsequent filtered changes
      autoInitialViewRef.current = true
    }
  }, [mapFilterEnabled, itemsToShow, setViewed])

  // Update memoryIndex when selectedId changes
  useEffect(() => {
    if (!selectedId) return

    // Use O(1) map lookup
    const idx = itemsToShowMap.get(selectedId)
    if (idx !== undefined) {
      setMemoryIndex(idx)
      return
    }

    // Fallback to filtered
    const idx2 = filteredMap.get(selectedId)
    if (idx2 !== undefined) {
      setMemoryIndex(idx2)
    }
  }, [itemsToShowMap, filteredMap, selectedId, setMemoryIndex])

  useEffect(() => {
    const timeout = setTimeout(() => {
      setVisibleCount(itemsToShow.length)
    }, 100)
    return () => clearTimeout(timeout)
  }, [itemsToShow.length, setVisibleCount])

  // Clear clearing flag after gallery repositions during clear
  useEffect(() => {
    if (isClearing && !mapFilterEnabled) {
      // Wait for gallery to reposition, then clear flag and coordinates
      const timeout = setTimeout(() => {
        setIsClearing(false)
        setClearCoordinates(null)
      }, 200)
      return () => clearTimeout(timeout)
    }
  }, [mapFilterEnabled, memoryIndex, isClearing])

  return {
    refImageGallery,
    memoryIndex,
    setMemoryIndex,
    setViewed,
    memoryHtml,
    viewedList,
    filtered,
    keyword,
    searchBox,
    mapFilterEnabled,
    handleToggleMapFilter,
    handleBoundsChange,
    itemsToShow,
    selectedId,
    selectById,
    isClearing,
    clearCoordinates,
  }
}
