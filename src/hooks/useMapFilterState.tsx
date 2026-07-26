'use client'

import { useCallback, useEffect, useState } from 'react'

import type { Bounds } from '../lib/map-filtering'

export default function useMapFilterState() {
  const [mapFilterEnabled, setMapFilterEnabled] = useState(false)
  const [mapBounds, setMapBounds] = useState<Bounds | null>(null)
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

    setMapBounds((previousBounds) => {
      if (
        previousBounds
        && previousBounds[0][0] === bounds[0][0]
        && previousBounds[0][1] === bounds[0][1]
        && previousBounds[1][0] === bounds[1][0]
        && previousBounds[1][1] === bounds[1][1]
      ) {
        return previousBounds
      }

      return bounds
    })
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
