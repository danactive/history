'use client'
import { useCallback, useMemo, useRef, useState, useEffect, type Dispatch, type SetStateAction } from 'react'
import type ReactImageGallery from 'react-image-gallery'
import useMemory from './useMemory'
import useSearch from './useSearch'
import type { All } from '../types/pages'
import type { Item } from '../types/common'

type Bounds = [[number, number],[number, number]]

export default function useMapFilter({ items, indexedKeywords }: All.ComponentProps) {
  const refImageGallery = useRef<ReactImageGallery>(null)
  const [memoryIndex, setMemoryIndexState] = useState(0)

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

  const itemsToShow: Item[] = useMemo(() => {
    if (!mapFilterEnabled || !mapBounds) return filtered
    const [[swLng, swLat], [neLng, neLat]] = mapBounds
    return filtered.filter(it => {
      const coords = it.coordinates as [number, number] | undefined
      if (!coords) return false
      const [lng, lat] = coords
      return lng >= swLng && lng <= neLng && lat >= swLat && lat <= neLat
    })
  }, [mapFilterEnabled, mapBounds, filtered])

  const { setViewed, memoryHtml, viewedList } = useMemory(itemsToShow, refImageGallery)

  const handleToggleMapFilter = useCallback(() => {
    setMapFilterEnabled(prev => {
      const next = !prev
      if (prev) setMapBounds(null) // turning off clears bounds only
      return next
    })
  }, [])

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
