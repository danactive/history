'use client'

import { useMemo } from 'react'
import config from '../../../src/models/config'
import useMapFilter from '../../hooks/useMapFilter'
import useSelectGalleryItemFromUrl from '../../hooks/useSelectGalleryItemFromUrl'
import { All } from '../../types/pages'
import AlbumContext from '../Context'
import FilterArea from '../Search/FilterArea'
import SplitViewer from '../SplitViewer'
import AllItems from './Items'

export default function AllClient({
  gallery,
  items,
  totalItemCount,
  indexedKeywords,
  personOptions,
  tagOptions,
  clusteredMarkers,
  visitedFilterLabel,
}: All.ComponentProps) {
  const zooms = useMemo(() => ({ geo: { zoom: config.defaultZoom } }), [config.defaultZoom])

  const {
    refImageGallery,
    memoryIndex,
    setMemoryIndex,
    setViewed,
    memoryHtml,
    viewedList,
    searchBox,
    mapFilterEnabled,
    handleToggleMapFilter,
    handleBoundsChange,
    itemsToShow,
    isClearing,
    clearCoordinates,
  } = useMapFilter({
    gallery,
    items,
    totalCount: totalItemCount,
    indexedKeywords,
    personOptions,
    tagOptions,
    visitedFilterLabel,
    ownedPersonFilter: true,
  })

  useSelectGalleryItemFromUrl({
    items: itemsToShow,
    refImageGallery,
    setMemoryIndex,
    setViewed,
    defer: true,
  })

  return (
    <div>
      <AlbumContext.Provider value={zooms}>
        <FilterArea
          searchControls={searchBox}
          memoryContent={memoryHtml}
        />
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
          refImageGallery={refImageGallery}
          viewedList={viewedList}
        />
      </AlbumContext.Provider>
    </div>
  )
}
