'use client'

import { useMemo } from 'react'
import type ReactImageGallery from 'react-image-gallery'
import config from '../../../src/models/config'
import type { All } from '../../types/pages'
import AlbumContext from '../Context'
import SplitViewer from '../SplitViewer'
import AllItems from '../All/Items'
import usePersonsFilter from '../../hooks/usePersonsFilter'

export default function PersonsClient({ items, indexedKeywords }: All.ComponentProps) {
  const {
    refImageGallery,
    memoryIndex,
    setMemoryIndex,
    setViewed,
    resetViewedList,
    viewedList,
    keyword,
    searchBox,
    mapFilterEnabled,
    handleToggleMapFilter,
    handleBoundsChange,
    controls,
    ageFiltered,
    itemsWithCorpus,
    memoryHtml,
    resetToken,
  } = usePersonsFilter({ items, indexedKeywords })

  const zooms = useMemo(() => ({ geo: { zoom: config.defaultZoom } }), [])

  const handleToggleWithReset = () => {
    resetViewedList()
    handleToggleMapFilter()
  }

  return (
    <div>
      <AlbumContext.Provider value={zooms}>
        {searchBox}
        {controls}
        {memoryHtml}
        <SplitViewer
          setViewed={setViewed}
          items={ageFiltered}
          refImageGallery={refImageGallery}
          memoryIndex={memoryIndex}
          setMemoryIndex={setMemoryIndex}
          mapFilterEnabled={mapFilterEnabled}
          onToggleMapFilter={handleToggleWithReset}
          onMapBoundsChange={handleBoundsChange}
        />
        <AllItems
          items={itemsWithCorpus}
          keyword={keyword}
          refImageGallery={refImageGallery}
          resetToken={resetToken}
        />
      </AlbumContext.Provider>
    </div>
  )
}
