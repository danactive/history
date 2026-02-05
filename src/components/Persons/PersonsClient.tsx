'use client'

import { useMemo, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

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
    isClearing,
    clearCoordinates,
    controls,
    ageFiltered,
    itemsWithCorpus,
    memoryHtml,
    overrideAgeSummary,
  } = usePersonsFilter({ items, indexedKeywords, initialAgeSummary })

  const searchParams = useSearchParams()
  const selectId = searchParams.get('select')

  // Handle URL ?select= parameter
  useEffect(() => {
    if (!selectId || ageFiltered.length === 0) return

    const idx = ageFiltered.findIndex(i => {
      const filename = Array.isArray(i.filename) ? i.filename[0] : i.filename
      return filename === selectId
    })

    if (idx >= 0) {
      setTimeout(() => {
        if (refImageGallery.current?.getCurrentIndex?.() !== idx) {
          refImageGallery.current?.slideToIndex(idx)
          setMemoryIndex(idx)
          setViewed(idx)
        }
      }, 0)
    }
  }, [selectId, ageFiltered, refImageGallery, setMemoryIndex, setViewed])

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
          isClearing={isClearing}
          clearCoordinates={clearCoordinates}
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
