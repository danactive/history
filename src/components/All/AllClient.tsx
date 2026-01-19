'use client'

import { useMemo, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

import config from '../../../src/models/config'
import useMapFilter from '../../hooks/useMapFilter'
import { All } from '../../types/pages'
import AlbumContext from '../Context'
import SplitViewer from '../SplitViewer'
import AllItems from './Items'

export default function AllClient({ items, indexedKeywords, clusteredMarkers }: All.ComponentProps) {
  const zooms = useMemo(() => ({ geo: { zoom: config.defaultZoom } }), [config.defaultZoom])

  const {
    refImageGallery,
    memoryIndex,
    setMemoryIndex,
    setViewed,
    memoryHtml,
    keyword,
    searchBox,
    mapFilterEnabled,
    handleToggleMapFilter,
    handleBoundsChange,
    itemsToShow,
    isClearing,
    clearCoordinates,
  } = useMapFilter({ items, indexedKeywords })

  const searchParams = useSearchParams()
  const selectId = searchParams.get('select')

  // Handle URL ?select= parameter
  useEffect(() => {
    if (!selectId || itemsToShow.length === 0) return

    const idx = itemsToShow.findIndex(i => {
      const filename = Array.isArray(i.filename) ? i.filename[0] : i.filename
      return filename === selectId
    })

    if (idx >= 0) {
      // Use timeout to allow gallery to process items update (which might reset index)
      // before enforcing the selected index
      setTimeout(() => {
        if (refImageGallery.current?.getCurrentIndex?.() !== idx) {
          refImageGallery.current?.slideToIndex(idx)
          setMemoryIndex(idx)
          setViewed(idx)
        }
      }, 0)
    }
  }, [selectId, itemsToShow, refImageGallery, setMemoryIndex, setViewed])

  return (
    <div>
      <AlbumContext.Provider value={zooms}>
        {searchBox}
        {memoryHtml}
        <SplitViewer
          setViewed={setViewed}
          items={itemsToShow}
          clusteredMarkers={clusteredMarkers}
          refImageGallery={refImageGallery}
          memoryIndex={memoryIndex}
          setMemoryIndex={setMemoryIndex}
          mapFilterEnabled={mapFilterEnabled}
          isClearing={isClearing}
          clearCoordinates={clearCoordinates}
          onToggleMapFilter={handleToggleMapFilter}
          onMapBoundsChange={handleBoundsChange}
        />
        <AllItems
          items={itemsToShow}
          keyword={keyword}
          refImageGallery={refImageGallery}
        />
      </AlbumContext.Provider>
    </div>
  )
}
