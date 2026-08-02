'use client'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useMemo } from 'react'
import type { FilterControlsProps } from '../components/Persons/FilterControls'
import type { Persons } from '../types/pages'
import type { PersonAgeFilterValue } from '../lib/persons'
import { parsePersonsRouteFilters } from '../lib/persons-route-filters'
import usePersonsDerivedData from './usePersonsDerivedData'
import useMapFilter from './useMapFilter'
import useMemory from './useMemory'
import usePersonsFilterControls from './usePersonsFilterControls'
import usePersonsRouteState from './usePersonsRouteState'

export default function usePersonsFilter({
  gallery,
  items,
  totalItemCount,
  indexedKeywords,
  tagOptions,
  initialAgeSummary,
  initialBaseScopeItems,
  initialAgeScopeItems,
  initialPersonScopeItems,
  initialSelectedAge,
  initialSelectedPerson,
}: Persons.ItemData & {
  totalItemCount?: number
  initialSelectedAge?: PersonAgeFilterValue
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const searchParamsSnapshot = searchParams.toString()
  const routeFilters = useMemo(
    () => parsePersonsRouteFilters(Object.fromEntries(new URLSearchParams(searchParamsSnapshot).entries())),
    [searchParamsSnapshot],
  )
  const resolvedInitialAge = initialSelectedAge ?? null
  const resolvedInitialPerson = initialSelectedPerson ?? null

  const {
    clearPersonFiltersWithoutUrlSync,
    hasActivePersonFilters,
    isServerScopeCurrent,
    selectedAge,
    selectedPerson,
    setSelectedAge,
    setSelectedPerson,
  } = usePersonsRouteState({
    initialSelectedAge: resolvedInitialAge,
    initialSelectedPerson: resolvedInitialPerson,
    pathname,
    replace: router.replace,
    routeFilters,
    searchParamsSnapshot,
  })

  const keywordFromUrl = routeFilters.keyword
  const {
    effectiveSelectedPerson,
    extraFilterChips,
    handleStructuredOptionSubmit,
  } = usePersonsFilterControls({
    items,
    keywordFromUrl,
    selectedAge,
    selectedPerson,
    setSelectedAge,
    setSelectedPerson,
  })

  const {
    refImageGallery,
    memoryIndex,
    setMemoryIndex,
    memoryHtml,
    viewedList,
    keyword,
    searchBox,
    setDisplayedItems,
    setVisibleCount,
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
    syncSearchState: false,
    indexedKeywords,
    tagOptions,
    personDetailsName: effectiveSelectedPerson,
    extraFilterChips,
    extraFiltersActive: hasActivePersonFilters,
    onClearExtraFilters: clearPersonFiltersWithoutUrlSync,
    extraQueryParamsToClear: ['age', 'person'],
    onStructuredOptionSubmit: handleStructuredOptionSubmit,
  })

  const {
    ageFiltered,
    agesWithCounts,
    itemsWithCorpus,
    peopleAtSelectedAge,
    peopleWithCounts,
    totalPhotoCount,
  } = usePersonsDerivedData({
    itemsToShow,
    selectedAge,
    effectiveSelectedPerson,
    initialSelectedPerson: resolvedInitialPerson,
    initialSelectedAge: resolvedInitialAge,
    initialBaseScopeItems,
    initialAgeScopeItems,
    initialPersonScopeItems,
    isServerScopeCurrent,
    keyword,
    mapFilterEnabled,
    initialAgeSummary,
    setSelectedAge,
  })

  useEffect(() => {
    setDisplayedItems(ageFiltered)
    setVisibleCount(ageFiltered.length)
  }, [ageFiltered, setDisplayedItems, setVisibleCount])

  const { memoryHtml: personsMemoryHtml, setViewed: personsSetViewed } = useMemory(
    ageFiltered,
    refImageGallery,
    { autoInitialView: false },
  )
  // Combined memoryHtml: prefer personsMemoryHtml (same structure)
  const finalMemoryHtml = personsMemoryHtml ?? memoryHtml

  const filterControlsProps: FilterControlsProps = {
    agesWithCounts,
    peopleAtSelectedAge,
    peopleWithCounts,
    selectedAge,
    selectedPerson,
    totalPhotoCount,
    setSelectedAge,
    setSelectedPerson,
  }

  return {
    // from map/search
    refImageGallery,
    memoryIndex,
    setMemoryIndex,
    setViewed: personsSetViewed,
    viewedList,
    keyword,
    searchBox,
    mapFilterEnabled,
    handleToggleMapFilter,
    handleBoundsChange,
    isClearing,
    clearCoordinates,
    // age/person
    selectedAge,
    setSelectedAge,
    selectedPerson,
    setSelectedPerson,
    filterControlsProps,
    // items
    ageFiltered,
    itemsWithCorpus,
    // memory
    memoryHtml: finalMemoryHtml,
  }
}
