'use client'

import { useCallback, useEffect, useState } from 'react'

import type { Bounds } from '../lib/map-filtering'
import { areMapBoundsEqual } from '../lib/map-filter-query'

export default function useMapFilterState(initialMapBounds: Bounds | null = null) {
  const [mapFilterEnabled, setMapFilterEnabled] = useState(Boolean(initialMapBounds))
  const [mapBounds, setMapBounds] = useState<Bounds | null>(initialMapBounds)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [clearCoordinates, setClearCoordinates] = useState<[number, number] | null>(null)
  const [isClearing, setIsClearing] = useState(false)

  const handleClearMapFilter = useCallback((coordinates?: [number, number] | null) => {
    if (coordinates) {
      setClearCoordinates(coordinates)
    }

    setIsClearing(true)
    setMapFilterEnabled(false)
    setMapBounds(null)
  }, [])

  const handleBoundsChange = useCallback((bounds: Bounds) => {
    if (!bounds) {
      return
    }

    setMapBounds(previousBounds => areMapBoundsEqual(previousBounds, bounds) ? previousBounds : bounds)
  }, [])

  const selectById = useCallback((id: string) => {
    setSelectedId((previousId) => (previousId === id ? previousId : id))
  }, [])

  const handleToggleMapFilter = useCallback((onEnable?: () => void) => {
    setMapFilterEnabled((previousEnabled) => {
      const nextEnabled = !previousEnabled

      if (nextEnabled) {
        onEnable?.()
      } else {
        setMapBounds(null)
      }

      return nextEnabled
    })
  }, [])

  useEffect(() => {
    if (isClearing && !mapFilterEnabled) {
      const timeout = setTimeout(() => {
        setIsClearing(false)
        setClearCoordinates(null)
      }, 200)

      return () => clearTimeout(timeout)
    }
  }, [isClearing, mapFilterEnabled])

  useEffect(() => {
    setMapBounds(previousBounds => areMapBoundsEqual(previousBounds, initialMapBounds) ? previousBounds : initialMapBounds)
    setMapFilterEnabled(Boolean(initialMapBounds))
  }, [initialMapBounds])

  return {
    clearCoordinates,
    handleBoundsChange,
    handleClearMapFilter,
    handleToggleMapFilter,
    isClearing,
    mapBounds,
    mapFilterEnabled,
    selectedId,
    selectById,
  }
}
