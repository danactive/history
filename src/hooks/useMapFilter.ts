'use client'
import { useCallback, useEffect, useMemo, useRef, type ReactNode } from 'react'
import type { ImageGalleryRef } from 'react-image-gallery'
import { buildSelectableItemIndex, filterItemsByMapBounds, resolveSelectedItemIndex } from '../lib/map-filtering'
import type { IndexedKeywords } from '../types/common'
import type { All } from '../types/pages'
import useMapFilterMemory from './useMapFilterMemory'
import useMemory from './useMemory'
import useMapFilterState from './useMapFilterState'
import useSearch from './useSearch'

type UseMapFilterProps = Pick<All.ItemData, 'gallery' | 'items' | 'indexedKeywords' | 'personOptions' | 'visitedFilterLabel' | 'trailingAction'> & {
  summaryLabel?: string
  totalCount?: number
  syncSearchState?: boolean
  personDetailsName?: string | null
  extraFilterChips?: ReactNode
  extraFiltersActive?: boolean
  onClearExtraFilters?: () => void
  extraQueryParamsToClear?: string[]
  onStructuredOptionSubmit?: (option: IndexedKeywords) => boolean
  ownedPersonFilter?: boolean
}

export default function useMapFilter({
  items,
  indexedKeywords,
  personOptions,
  visitedFilterLabel,
  trailingAction,
  gallery,
  personDetailsName,
  totalCount,
  syncSearchState = true,
  summaryLabel = 'Photos',
  extraFilterChips,
  extraFiltersActive,
  onClearExtraFilters,
  extraQueryParamsToClear,
  onStructuredOptionSubmit,
  ownedPersonFilter = false,
}: UseMapFilterProps) {
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
    handleBoundsChange,
    handleClearMapFilter,
    handleToggleMapFilter,
    isClearing,
    mapBounds,
    mapFilterEnabled,
    selectedId,
    selectById,
  } = useMapFilterState()

  const {
    filtered,
    keyword,
    searchBox,
    setVisibleCount,
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
    visitedFilterLabel,
    refImageGallery,
    mapFilterEnabled,
    onClearMapFilter: handleClearMapFilter,
    personDetailsName,
    selectById,
    trailingAction,
    extraFilterChips,
    extraFiltersActive,
    onClearExtraFilters,
    extraQueryParamsToClear,
    onStructuredOptionSubmit,
    ownedPersonFilter,
  })

  const itemsToShow = useMemo(() => {
    return filterItemsByMapBounds(filtered, mapFilterEnabled, mapBounds)
  }, [mapFilterEnabled, mapBounds, filtered])

  // Memoized ID-to-index maps for O(1) lookups (critical for large datasets)
  const itemsToShowMap = useMemo(() => buildSelectableItemIndex(itemsToShow), [itemsToShow])

  const filteredMap = useMemo(() => buildSelectableItemIndex(filtered), [filtered])

  // Update displayed items whenever itemsToShow changes
  useEffect(() => {
    if (!syncSearchState) {
      return
    }

    setDisplayedItems(itemsToShow)
  }, [itemsToShow, setDisplayedItems, syncSearchState])

  const { setViewed, memoryHtml, viewedList } = useMemory(
    itemsToShow,
    refImageGallery,
    { autoInitialView: autoInitialViewRef.current },
  )

  const handleToggleMapFilterWithMemoryReset = useCallback(() => {
    handleToggleMapFilter(() => {
      prepareForMapFilterEnable()
    })
  }, [handleToggleMapFilter, prepareForMapFilterEnable])

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

  useEffect(() => {
    if (!syncSearchState) {
      return
    }

    const timeout = setTimeout(() => {
      setVisibleCount(itemsToShow.length)
    }, 100)
    return () => clearTimeout(timeout)
  }, [itemsToShow.length, setVisibleCount, syncSearchState])

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
    setVisibleCount,
    mapFilterEnabled,
    handleToggleMapFilter: handleToggleMapFilterWithMemoryReset,
    handleBoundsChange,
    itemsToShow,
    selectedId,
    selectById,
    isClearing,
    clearCoordinates,
  }
}
