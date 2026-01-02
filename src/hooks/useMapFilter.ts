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

  const setMemoryIndex: Dispatch<SetStateAction<number>> = useCallback((value) => {
    setMemoryIndexState(prev => {
      const next = typeof value === 'function' ? value(prev) : value
      return prev === next ? prev : next
    })
  }, [])

  const {
    filtered,
    keyword,
    searchBox,
    setVisibleCount,
  } = useSearch({ items, setMemoryIndex, indexedKeywords })

  const [mapFilterEnabled, setMapFilterEnabled] = useState(false)
  const [mapBounds, setMapBounds] = useState<Bounds | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)

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

  const selectById = useCallback((id: string) => {
    setSelectedId(prev => (prev === id ? prev : id))
    const idx = itemsToShow.findIndex(i => i.id === id)
    if (idx >= 0) {
      setMemoryIndex(idx)
      return
    }
    const idx2 = filtered.findIndex(i => i.id === id)
    if (idx2 >= 0) setMemoryIndex(idx2)
  }, [itemsToShow, filtered, setMemoryIndex])

  useEffect(() => {
    if (selectedId) {
      const idx = itemsToShow.findIndex(i => i.id === selectedId)
      if (idx >= 0) {
        setMemoryIndex(idx)
        return
      }
    }
    if (itemsToShow.length === 0) {
      setMemoryIndex(0)
    } else if (memoryIndex >= itemsToShow.length) {
      setMemoryIndex(itemsToShow.length - 1)
    }
  }, [itemsToShow, selectedId, memoryIndex, setMemoryIndex])

  useEffect(() => {
    const timeout = setTimeout(() => {
      setVisibleCount(itemsToShow.length)
    }, 100)
    return () => clearTimeout(timeout)
  }, [itemsToShow.length, setVisibleCount])

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
  }
}
