'use client'
import { useCallback, useMemo, useRef, useState, useEffect } from 'react'
import type ReactImageGallery from 'react-image-gallery'
import useMemory from '../hooks/useMemory'
import useSearch from '../hooks/useSearch'
import type { All } from '../types/pages'

export default function useMapFilter({ items, indexedKeywords }: All.ComponentProps) {
  const refImageGallery = useRef<ReactImageGallery>(null)
  const [memoryIndex, setMemoryIndexState] = useState(0)

  // stable setter used by other hooks to avoid changing identity each render
  const setMemoryIndex = useCallback((idx: number) => {
    setMemoryIndexState((prev) => (prev === idx ? prev : idx))
  }, [])

  const {
    filtered,
    keyword,
    searchBox,
  } = useSearch({ items, setMemoryIndex, indexedKeywords })

  const { setViewed, memoryHtml, viewedList } = useMemory(filtered, refImageGallery)

  const [mapFilterEnabled, setMapFilterEnabled] = useState(false)
  const [mapBounds, setMapBounds] = useState<[[number, number],[number, number]] | null>(null)

  // track the selected item id to keep selection stable across list changes
  const [selectedId, setSelectedId] = useState<string | null>(null)

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

  // when selecting by id, set selectedId and update index (resolves into current itemsToShow)
  const selectById = useCallback((id: string) => {
    setSelectedId((prev) => (prev === id ? prev : id))
    const idx = itemsToShow.findIndex(i => i.id === id)
    if (idx >= 0) {
      setMemoryIndex(idx)
      return
    }
    // fallback to filtered index if not visible in itemsToShow
    const idx2 = filtered.findIndex(i => i.id === id)
    if (idx2 >= 0) {
      setMemoryIndex(idx2)
    }
  }, [itemsToShow, filtered, setMemoryIndex])

  // keep selection stable when itemsToShow changes:
  // - if selectedId exists and is present in itemsToShow, set memoryIndex to that position
  // - otherwise clamp memoryIndex to valid range (without changing selectedId)
  useEffect(() => {
    if (selectedId) {
      const idx = itemsToShow.findIndex(i => i.id === selectedId)
      if (idx >= 0) {
        setMemoryIndex(idx)
        return
      }
    }

    // clamp index if out of bounds
    if (itemsToShow.length === 0) {
      setMemoryIndex(0)
    } else {
      setMemoryIndex((prev) => (prev >= itemsToShow.length ? itemsToShow.length - 1 : prev))
    }
  }, [itemsToShow, selectedId, setMemoryIndex])

  // expose raw state setter too (for legacy callers) but keep it stable reference
  const setMemoryIndexRaw = setMemoryIndex

  return {
    // UI / interaction
    refImageGallery,
    memoryIndex,
    setMemoryIndex: setMemoryIndexRaw,
    setViewed,
    memoryHtml,
    viewedList,

    // search state
    filtered,
    keyword,
    searchBox,

    // map filter controls
    mapFilterEnabled,
    handleToggleMapFilter,
    handleBoundsChange,
    itemsToShow,

    // selection helpers
    selectedId,
    selectById,
  }
}
