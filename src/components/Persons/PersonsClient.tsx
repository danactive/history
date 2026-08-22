'use client'

import Button from '@mui/joy/Button'
import { useMemo } from 'react'
import config from '../../../src/models/config'
import usePersonsFilter from '../../hooks/usePersonsFilter'
import useSelectGalleryItemFromUrl from '../../hooks/useSelectGalleryItemFromUrl'
import { generateClusters } from '../../lib/generate-clusters'
import type { Persons } from '../../types/pages'
import AllItems from '../All/Items'
import AlbumContext from '../Context'
import FilterControls from './FilterControls'
import EmptyResults from '../Search/EmptyResults'
import FilterArea from '../Search/FilterArea'
import SplitViewer from '../SplitViewer'

export default function PersonsClient({
  gallery,
  items,
  totalItemCount,
  indexedKeywords,
  personOptions,
  tagOptions,
  activeFacetCounts,
  clusteredMarkers,
  initialAgeSummary,
  initialBaseScopeItems,
  initialSelectedAge,
  initialSelectedPerson,
}: Persons.ComponentProps) {
  const {
    refImageGallery,
    memoryIndex,
    setMemoryIndex,
    setViewed,
    searchBox,
    mapFilterEnabled,
    mapBounds,
    handleToggleMapFilter,
    handleBoundsChange,
    isClearing,
    clearCoordinates,
    selectionCoordinator,
    filterControlsProps,
    ageFiltered,
    itemsWithCorpus,
    viewedList,
    memoryHtml,
    selectedAge,
    selectedPerson,
    setSelectedAge,
    setSelectedPerson,
  } = usePersonsFilter({
    gallery,
    items,
    totalItemCount,
    indexedKeywords,
    personOptions,
    tagOptions,
    activeFacetCounts,
    initialAgeSummary,
    initialBaseScopeItems,
    initialSelectedAge,
    initialSelectedPerson,
  })

  useSelectGalleryItemFromUrl({
    items: ageFiltered,
    refImageGallery,
    setMemoryIndex,
    setViewed,
    selectionCoordinator,
  })

  const hasActivePersonsFilters = selectedAge !== null || selectedPerson !== null
  const visibleClusteredMarkers = useMemo(
    () => hasActivePersonsFilters ? generateClusters(ageFiltered) : clusteredMarkers,
    [ageFiltered, clusteredMarkers, hasActivePersonsFilters],
  )

  const zooms = useMemo(() => ({ geo: { zoom: config.defaultZoom } }), [])

  return (
    <div>
      <AlbumContext.Provider value={zooms}>
        <FilterArea
          searchControls={searchBox}
          contextualControls={<FilterControls {...filterControlsProps} />}
          emptyResults={ageFiltered.length === 0 ? (
            <EmptyResults
              message="No photos match the current filters."
              action={hasActivePersonsFilters ? (
                <Button
                  size="sm"
                  variant="outlined"
                  onClick={() => {
                    setSelectedAge(null)
                    setSelectedPerson(null)
                  }}
                >
                  Reset age/person filters
                </Button>
              ) : null}
            />
          ) : null}
          memoryContent={memoryHtml}
        />
        <SplitViewer
          clusteredMarkers={visibleClusteredMarkers}
          items={ageFiltered}
          refImageGallery={refImageGallery}
          memoryIndex={memoryIndex}
          mapFilterEnabled={mapFilterEnabled}
          mapBounds={mapBounds}
          isClearing={isClearing}
          clearCoordinates={clearCoordinates}
          selectionCoordinator={selectionCoordinator}
          onToggleMapFilter={handleToggleMapFilter}
          onMapBoundsChange={handleBoundsChange}
        />
        <AllItems
          items={itemsWithCorpus}
          refImageGallery={refImageGallery}
          viewedList={viewedList}
          onSelectId={(id) => selectionCoordinator.selectId(id, { origin: 'thumbnail' })}
        />
      </AlbumContext.Provider>
    </div>
  )
}
