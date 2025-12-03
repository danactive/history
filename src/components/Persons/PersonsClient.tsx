'use client'

import { useMemo } from 'react'

import config from '../../../src/models/config'
import usePersonsFilter from '../../hooks/usePersonsFilter'
import type { All } from '../../types/pages'
import AllItems from '../All/Items'
import AlbumContext from '../Context'
import SplitViewer from '../SplitViewer'

export default function PersonsClient({
  items,
  indexedKeywords,
  clusteredMarkers,
  initialAgeSummary,
}: All.ComponentProps) {
  const {
    refImageGallery,
    memoryIndex,
    setMemoryIndex,
    setViewed,
    keyword,
    searchBox,
    mapFilterEnabled,
    handleToggleMapFilter,
    handleBoundsChange,
    controls,
    ageFiltered,
    itemsWithCorpus,
    memoryHtml,
    overrideAgeSummary,
  } = usePersonsFilter({ items, indexedKeywords, initialAgeSummary })

  // Replace controls age list if override available
  const finalControls = overrideAgeSummary ?? controls

  const zooms = useMemo(() => ({ geo: { zoom: config.defaultZoom } }), [])

  return (
    <div>
      <AlbumContext.Provider value={zooms}>
        {searchBox}
        {finalControls}
        {memoryHtml}
        <SplitViewer
          setViewed={setViewed}
          clusteredMarkers={clusteredMarkers}
          items={ageFiltered}
          refImageGallery={refImageGallery}
          memoryIndex={memoryIndex}
          setMemoryIndex={setMemoryIndex}
          mapFilterEnabled={mapFilterEnabled}
          onToggleMapFilter={handleToggleMapFilter}
          onMapBoundsChange={handleBoundsChange}
        />
        <AllItems
          items={itemsWithCorpus}
          keyword={keyword}
          refImageGallery={refImageGallery}
        />
      </AlbumContext.Provider>
    </div>
  )
}
