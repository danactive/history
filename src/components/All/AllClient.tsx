'use client'

import { useMemo } from 'react'
import type ReactImageGallery from 'react-image-gallery'

import config from '../../../src/models/config'
import { All } from '../../types/pages'
import AlbumContext from '../Context'
import SplitViewer from '../SplitViewer'
import AllItems from './Items'
import useMapFilter from '../../hooks/useMapFilter'
import type { ServerSideAllItem } from '../../types/common'

export default function AllClient({ items, indexedKeywords }: All.ComponentProps) {
  const zooms = useMemo(() => ({ geo: { zoom: config.defaultZoom } }), [])

  const {
    refImageGallery,
    memoryIndex,
    setMemoryIndex,
    setViewed,
    resetViewedList,
    memoryHtml,
    keyword,
    searchBox,
    mapFilterEnabled,
    handleToggleMapFilter,
    handleBoundsChange,
    itemsToShow,
  } = useMapFilter({ items, indexedKeywords })

  const resetToken = mapFilterEnabled ? 1 : 0

  const itemsWithCorpus: ServerSideAllItem[] = useMemo(
    () => itemsToShow.map(i => ({
      // ensure required corpus & coordinateAccuracy satisfy ServerSideAllItem
      corpus: (i as any).corpus ?? '',
      ...i,
      coordinateAccuracy: i.coordinateAccuracy ?? 0,
    })),
    [itemsToShow],
  )

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
          items={itemsWithCorpus}
          keyword={keyword}
          refImageGallery={refImageGallery}
          resetToken={resetToken}
        />
      </AlbumContext.Provider>
    </div>
  )
}
