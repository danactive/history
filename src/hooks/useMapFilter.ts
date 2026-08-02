'use client'
import { useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import type { ImageGalleryRef } from 'react-image-gallery'
import { buildSelectableItemIndex, resolveSelectedItemIndex } from '../lib/map-filtering'
import { mapBoundsSearchParam, parseMapBounds } from '../lib/map-filter-query'
import type { All, SearchMetadata, SearchUiConfig } from '../types/pages'
import useMapFilterMemory from './useMapFilterMemory'
import useMemory from './useMemory'
import useMapFilterState from './useMapFilterState'
import useSearch from './useSearch'

type UseMapFilterProps = SearchMetadata & SearchUiConfig & Pick<All.ItemData, 'gallery' | 'items' | 'trailingAction'>

export default function useMapFilter({
  items,
  indexedKeywords,
  personOptions,
  tagOptions,
  activeFacetCounts,
  trailingAction,
  gallery,
  personDetailsName,
  totalCount,
  summaryLabel = 'Photos',
  extraFilterChips,
  extraFiltersActive,
  onClearExtraFilters,
  extraQueryParamsToClear = [],
  onStructuredOptionSubmit,
  ownedPersonFilter = false,
}: UseMapFilterProps) {
  const searchParams = useSearchParams()
  const mapBoundsParam = searchParams.get(mapBoundsSearchParam)
  const initialMapBounds = useMemo(
    () => parseMapBounds(mapBoundsParam),
    [mapBoundsParam],
  )
  const refImageGallery = useRef<ImageGalleryRef>(null)
  const {
    autoInitialViewRef,
    memoryIndex,
    prepareForMapFilterEnable,
    resetIndexOnEnableRef,
    setMemoryIndex,
  } = useMapFilterMemory()

  const {
    clearCoordinates,
    handleBoundsChange: setMapBounds,
    handleClearMapFilter: clearMapFilter,
    handleToggleMapFilter: toggleMapFilter,
    isClearing,
    mapBounds,
    mapFilterEnabled,
    selectedId,
    selectById,
  } = useMapFilterState(initialMapBounds)

  const handleBoundsChange = useCallback((bounds: Parameters<typeof setMapBounds>[0]) => {
    setMapBounds(bounds)
  }, [setMapBounds])

  const handleClearMapFilter = useCallback((coordinates?: [number, number] | null) => {
    clearMapFilter(coordinates)
  }, [clearMapFilter])

  const {
    filtered,
    visibleItems,
    keyword,
    searchBox,
    setDisplayedItems,
  } = useSearch({
    gallery,
    items,
    summaryLabel,
    totalCount,
    memoryIndex,
    setMemoryIndex,
    indexedKeywords,
    personOptions,
    tagOptions,
    activeFacetCounts,
    refImageGallery,
    mapFilterEnabled,
    mapBounds,
    onClearMapFilter: handleClearMapFilter,
    personDetailsName,
    selectById,
    trailingAction,
    extraFilterChips,
    extraFiltersActive,
    onClearExtraFilters,
    extraQueryParamsToClear: [
      mapBoundsSearchParam,
      ...extraQueryParamsToClear.filter(key => key !== mapBoundsSearchParam),
    ],
    onStructuredOptionSubmit,
    ownedPersonFilter,
  })

  const itemsToShow = visibleItems

  // Memoized ID-to-index maps for O(1) lookups (critical for large datasets)
  const itemsToShowMap = useMemo(() => buildSelectableItemIndex(itemsToShow), [itemsToShow])

  const filteredMap = useMemo(() => buildSelectableItemIndex(filtered), [filtered])

  const { setViewed, memoryHtml, viewedList } = useMemory(
    itemsToShow,
    refImageGallery,
    { autoInitialView: autoInitialViewRef.current },
  )

  const handleToggleMapFilterWithMemoryReset = useCallback(() => {
    toggleMapFilter(() => {
      prepareForMapFilterEnable()
    })
  }, [prepareForMapFilterEnable, toggleMapFilter])

  useEffect(() => {
    if (mapFilterEnabled && resetIndexOnEnableRef.current) {
      resetIndexOnEnableRef.current = false
      setMemoryIndex(0)

      if (refImageGallery.current) {
        refImageGallery.current.slideToIndex(0)
      }

      setViewed(0)
      autoInitialViewRef.current = true
    }
  }, [autoInitialViewRef, mapFilterEnabled, refImageGallery, resetIndexOnEnableRef, setMemoryIndex, setViewed])

  // Update memoryIndex when selectedId changes
  useEffect(() => {
    const nextIndex = resolveSelectedItemIndex(selectedId, itemsToShowMap, filteredMap)
    if (nextIndex !== null) {
      setMemoryIndex(nextIndex)
    }
  }, [itemsToShowMap, filteredMap, selectedId, setMemoryIndex])

  return {
    refImageGallery,
    memoryIndex,
    setMemoryIndex,
    setViewed,
    memoryHtml,
    viewedList,
    filtered,
    keyword,
    searchBox,
    setDisplayedItems,
    mapFilterEnabled,
    mapBounds,
    handleToggleMapFilter: handleToggleMapFilterWithMemoryReset,
    handleBoundsChange,
    itemsToShow,
    selectedId,
    selectById,
    isClearing,
    clearCoordinates,
  }
}
