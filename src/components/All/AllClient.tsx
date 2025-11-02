'use client'

import { useMemo } from 'react'

import config from '../../../src/models/config'
import { All } from '../../types/pages'
import AlbumContext from '../Context'
import SplitViewer from '../SplitViewer'
import AllItems from './Items'
import useMapFilter from '../../hooks/useMapFilter'

export default function AllClient({ items, indexedKeywords }: All.ComponentProps) {
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
