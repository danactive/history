'use client'

import Button from '@mui/joy/Button'
import { useSearchParams } from 'next/navigation'
import { useEffect, useMemo } from 'react'
import config from '../../../src/models/config'
import usePersonsFilter from '../../hooks/usePersonsFilter'
import type { All } from '../../types/pages'
import { getPrimaryFilename } from '../../utils'
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
  clusteredMarkers,
  initialAgeSummary,
  initialSelectedAge,
  initialSelectedPerson,
}: All.ComponentProps) {
  const {
    refImageGallery,
    memoryIndex,
    setMemoryIndex,
    setViewed,
    searchBox,
    mapFilterEnabled,
    handleToggleMapFilter,
    handleBoundsChange,
    isClearing,
    clearCoordinates,
    filterControlsProps,
    ageFiltered,
    itemsWithCorpus,
    viewedList,
    memoryHtml,
    selectedAge,
    selectedPerson,
    setSelectedAge,
    setSelectedPerson,
  } = usePersonsFilter({ gallery, items, totalItemCount, indexedKeywords, initialAgeSummary, initialSelectedAge, initialSelectedPerson })

  const searchParams = useSearchParams()
  const selectId = searchParams.get('select')

  // Handle URL ?select= parameter
  useEffect(() => {
    if (!selectId || ageFiltered.length === 0) return

    const idx = ageFiltered.findIndex(i => {
      const filename = getPrimaryFilename(i.filename)
      return filename === selectId
    })

    if (idx < 0) return
    if (refImageGallery.current?.getCurrentIndex?.() === idx) return

    refImageGallery.current?.slideToIndex(idx)
    setMemoryIndex(idx)
    setViewed(idx)
  }, [selectId, ageFiltered, refImageGallery, setMemoryIndex, setViewed])

  const hasActivePersonsFilters = selectedAge !== null || selectedPerson !== null

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
          refImageGallery={refImageGallery}
          viewedList={viewedList}
        />
      </AlbumContext.Provider>
    </div>
  )
}
