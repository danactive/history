'use client'

import { useMemo } from 'react'

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
  } = useMapFilter({ items, indexedKeywords })

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
