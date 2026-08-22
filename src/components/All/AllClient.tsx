'use client'

import { useMemo, useState } from 'react'
import config from '../../../src/models/config'
import useMapFilter from '../../hooks/useMapFilter'
import useSelectGalleryItemFromUrl from '../../hooks/useSelectGalleryItemFromUrl'
import { expandAllPageItems, type CompactAllPageItem } from '../../lib/all-client-items'
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
  activeFacetCounts,
  clusteredMarkers,
}: Omit<All.ComponentProps, 'items'> & { items: CompactAllPageItem[] }) {
  const [isMapVisible, setIsMapVisible] = useState(true)
  const zooms = useMemo(() => ({ geo: { zoom: config.defaultZoom } }), [config.defaultZoom])
  const expandedItems = useMemo(() => expandAllPageItems(items, gallery), [gallery, items])

  const {
    refImageGallery,
    memoryIndex,
    setMemoryIndex,
    setViewed,
    memoryHtml,
    viewedList,
    searchBox,
    mapFilterEnabled,
    mapBounds,
    handleToggleMapFilter,
    handleBoundsChange,
    itemsToShow,
    isClearing,
    clearCoordinates,
    selectionCoordinator,
  } = useMapFilter({
    gallery,
    items: expandedItems,
    totalCount: totalItemCount,
    indexedKeywords,
    personOptions,
    tagOptions,
    activeFacetCounts,
    ownedPersonFilter: true,
  })

  useSelectGalleryItemFromUrl({
    items: itemsToShow,
    refImageGallery,
    setMemoryIndex,
    setViewed,
    selectionCoordinator,
    defer: true,
  })

  return (
    <div>
      <AlbumContext.Provider value={zooms}>
        <FilterArea
          searchControls={searchBox}
          isMapVisible={isMapVisible}
          setIsMapVisible={setIsMapVisible}
          memoryContent={memoryHtml}
        />
        <SplitViewer
          items={itemsToShow}
          clusteredMarkers={clusteredMarkers}
          refImageGallery={refImageGallery}
          memoryIndex={memoryIndex}
          mapVisible={isMapVisible}
          mapFilterEnabled={mapFilterEnabled}
          mapBounds={mapBounds}
          isClearing={isClearing}
          clearCoordinates={clearCoordinates}
          selectionCoordinator={selectionCoordinator}
          onToggleMapFilter={handleToggleMapFilter}
          onMapBoundsChange={handleBoundsChange}
        />
        <AllItems
          items={itemsToShow}
          refImageGallery={refImageGallery}
          viewedList={viewedList}
          onSelectId={(id) => selectionCoordinator.selectId(id, { origin: 'thumbnail' })}
        />
      </AlbumContext.Provider>
    </div>
  )
}
