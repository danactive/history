'use client'

import { useMemo, useRef, useState, useCallback } from 'react'
import type ReactImageGallery from 'react-image-gallery'

import config from '../../../src/models/config'

import useMemory from '../../hooks/useMemory'
import useSearch from '../../hooks/useSearch'
import { All } from '../../types/pages'
import AlbumContext from '../Context'
import SplitViewer from '../SplitViewer'
import AllItems from './Items'

export default function AllClient({ items, indexedKeywords }: All.ComponentProps) {
  const refImageGallery = useRef<ReactImageGallery>(null)
  const [memoryIndex, setMemoryIndex] = useState(0)
  const {
    filtered,
    keyword,
    searchBox,
  } = useSearch({ items, setMemoryIndex, indexedKeywords })
  const { setViewed, memoryHtml } = useMemory(filtered, refImageGallery)

  const zooms = useMemo(() => ({ geo: { zoom: config.defaultZoom } }), [config.defaultZoom])

  const [mapFilterEnabled, setMapFilterEnabled] = useState(false)
  const [mapBounds, setMapBounds] = useState<[[number, number],[number, number]] | null>(null)

  const handleToggleMapFilter = useCallback(() => {
    setMapFilterEnabled((v) => !v)
    // clear bounds when turning off
    if (mapFilterEnabled) setMapBounds(null)
  }, [mapFilterEnabled])

  const handleBoundsChange = useCallback((bounds: [[number, number],[number, number]]) => {
    setMapBounds(bounds)
  }, [])

  // compute items visible when map filter is enabled
  const itemsToShow = useMemo(() => {
    if (!mapFilterEnabled || !mapBounds) return filtered

    const [[swLng, swLat], [neLng, neLat]] = mapBounds
    return filtered.filter((it) => {
      const coords = it.coordinates ?? [0, 0]
      const [lng, lat] = coords // expecting [lng, lat]
      const inLng = lng >= swLng && lng <= neLng
      const inLat = lat >= swLat && lat <= neLat
      return inLng && inLat
    })
  }, [mapFilterEnabled, mapBounds, filtered])

  return (
    <div>
      <AlbumContext.Provider value={zooms}>
        {searchBox}
        {memoryHtml}
        <SplitViewer
          setViewed={setViewed}
          items={itemsToShow}
          refImageGallery={refImageGallery}
          memoryIndex={memoryIndex}
          setMemoryIndex={setMemoryIndex}
          mapFilterEnabled={mapFilterEnabled}
          onToggleMapFilter={handleToggleMapFilter}
          onMapBoundsChange={handleBoundsChange}
        />
        <AllItems items={itemsToShow} keyword={keyword} refImageGallery={refImageGallery} />
      </AlbumContext.Provider>
    </div>
  )
}
