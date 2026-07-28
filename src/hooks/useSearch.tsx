'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import {
  type Dispatch, type SetStateAction,
  useCallback,
  useMemo, useRef,
} from 'react'
import Controls from '../components/Search/Controls'
import RemovableFilterChip from '../components/Search/RemovableFilterChip'
import { filterItemsBySelectedPerson } from '../lib/filter-selected-person'
import { buildSearchOptions } from '../lib/domains/search'
import { getVisitedPlaceFromSearchParams } from '../lib/domains/visited'
import {
  filterByKeyword,
  filterByVisitedPlace,
  parseKeywordQuery,
} from '../lib/search-filtering'
import { formatVisitedPlace } from '../lib/visited-core'
import { Gallery, IndexedKeywords, VisitedPlace } from '../types/common'
import useBookmark from './useBookmark'
import useSearchController from './useSearchController'
import useSearchDetailActions from './useSearchDetailActions'
import useVisibleSearchState from './useVisibleSearchState'
import styles from './search.module.css'

export { parseKeywordQuery } from '../lib/search-filtering'

interface SearchableItem {
  corpus: string;
  city?: string;
  year?: string | null;
  photoDate?: string | null;
  persons?: { full: string }[] | null;
  search?: string | null;
  visitedPlace?: VisitedPlace | null;
}

type FilenameItem = SearchableItem & {
  filename: string | string[];
}

interface UseSearchProps<ItemType> {
  gallery: Gallery;
  items: ItemType[];
  summaryLabel?: string;
  totalCount?: number;
  memoryIndex?: number;
  setMemoryIndex?: Dispatch<SetStateAction<number>>;
  indexedKeywords?: IndexedKeywords[];
  visitedFilterLabel?: string | null;
  refImageGallery?: React.RefObject<any>;
  mapFilterEnabled?: boolean;
  onClearMapFilter?: (coordinates?: [number, number] | null) => void;
  personDetailsName?: string | null;
  selectById?: (id: string, isClear?: boolean) => void;
  trailingAction?: React.ReactNode;
  extraFilterChips?: React.ReactNode;
  extraFiltersActive?: boolean;
  onClearExtraFilters?: () => void;
  extraQueryParamsToClear?: string[];
  onStructuredOptionSubmit?: (option: IndexedKeywords) => boolean;
  ownedPersonFilter?: boolean;
}

function hasFilename(item: SearchableItem): item is FilenameItem {
  return 'filename' in item && Boolean(item.filename)
}

export default function useSearch<ItemType extends SearchableItem>({
  gallery,
  items,
  summaryLabel,
  totalCount,
  memoryIndex,
  setMemoryIndex,
  indexedKeywords = [],
  visitedFilterLabel,
  refImageGallery,
  mapFilterEnabled,
  onClearMapFilter,
  personDetailsName,
  selectById,
  trailingAction,
  extraFilterChips,
  extraFiltersActive = false,
  onClearExtraFilters,
  extraQueryParamsToClear = [],
  onStructuredOptionSubmit,
  ownedPersonFilter = false,
}: UseSearchProps<ItemType>) {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const selectedPerson = ownedPersonFilter
    ? searchParams?.get('person')?.trim() || null
    : null

  const currentVisitedFilter = useMemo<VisitedPlace | null>(() => getVisitedPlaceFromSearchParams({
    visitedCountry: searchParams?.get('visitedCountry') ?? '',
    visitedRegion: searchParams?.get('visitedRegion') ?? '',
  }), [searchParams])

  const searchOptions = useMemo(
    () => buildSearchOptions(items, indexedKeywords),
    [items, indexedKeywords],
  )

  const knownPeople = useMemo(
    () => Array.from(new Set([
      ...indexedKeywords
        .filter((option) => option.filterKind === 'person')
        .map((option) => option.value),
      ...items.flatMap((item) => item.persons?.map((person) => person.full) ?? []),
    ])),
    [indexedKeywords, items],
  )

  const fallbackSelectedOption = useMemo(() => {
    const preferredPersonDetailsName = selectedPerson ?? personDetailsName

    if (!preferredPersonDetailsName || searchParams?.get('keyword') || currentVisitedFilter) {
      return null
    }

    return searchOptions.find((option) => (
      option.value === preferredPersonDetailsName && !option.visitedPlace
    )) ?? {
      label: preferredPersonDetailsName,
      value: preferredPersonDetailsName,
    }
  }, [currentVisitedFilter, personDetailsName, searchOptions, searchParams, selectedPerson])

  const visibleItemsRef = useRef<ItemType[]>(items)

  const {
    inputValue,
    keyword,
    selectedOption,
    setKeyword,
    applyKeywordToUrl,
    handleClear,
    handleClearAll,
    handleClearSelectedPerson,
    handleClearVisitedFilter,
    handleInputValueChange,
    handleSelectedOptionChange,
    handleSubmit,
  } = useSearchController<ItemType>({
    itemsRef: visibleItemsRef,
    searchOptions,
    currentVisitedFilter,
    fallbackSelectedOption,
    refImageGallery,
    setMemoryIndex,
    selectById,
    mapFilterEnabled,
    onClearMapFilter,
    onClearExtraFilters,
    extraQueryParamsToClear: ownedPersonFilter
      ? ['person', ...extraQueryParamsToClear.filter((key) => key !== 'person')]
      : extraQueryParamsToClear,
    onStructuredOptionSubmit,
    selectedPerson,
    ownedPersonFilter,
    knownPeople,
  })

  const visitedFiltered = useMemo(
    () => filterByVisitedPlace(items, currentVisitedFilter),
    [currentVisitedFilter, items],
  )

  const personFiltered = useMemo(
    () => filterItemsBySelectedPerson(visitedFiltered, selectedPerson),
    [selectedPerson, visitedFiltered],
  )

  const filtered = useMemo(
    () => filterByKeyword({ items: personFiltered, keyword, indexedKeywords }),
    [personFiltered, keyword, indexedKeywords],
  )

  const {
    itemsToUse,
    setDisplayedItems,
    setVisibleCount,
    visibleCount,
  } = useVisibleSearchState(filtered, items, visibleItemsRef)

  const parsedKeyword = useMemo(() => parseKeywordQuery(keyword), [keyword])
  const { detailActions } = useSearchDetailActions({
    gallery,
    items,
    keyword,
    personDetailsName: selectedPerson ?? personDetailsName,
    trailingAction,
  })

  const handleRemoveKeywordToken = useCallback((tokenIndex: number) => {
    if (parsedKeyword.isAdvanced) {
      handleClear()
      return
    }

    const remaining = parsedKeyword.tokens.filter((_, index) => index !== tokenIndex)
    if (remaining.length === 0) {
      handleClear()
      return
    }

    const joiner = parsedKeyword.mode === 'AND'
      ? ' && '
      : parsedKeyword.mode === 'OR'
        ? ' || '
        : ' '
    applyKeywordToUrl(remaining.join(joiner))
  }, [parsedKeyword, applyKeywordToUrl, handleClear])

  const canBookmark = Boolean(
    refImageGallery
    && itemsToUse.length
    && hasFilename(itemsToUse[0]),
  )

  const { BookmarkButton } = useBookmark({
    refImageGallery,
    displayedItems: itemsToUse,
    pathname,
    currentIndex: memoryIndex,
  })

  const activeVisitedFilterLabel = currentVisitedFilter
    ? formatVisitedPlace(currentVisitedFilter)
    : visitedFilterLabel

  const ownedPersonChip = selectedPerson ? (
    <RemovableFilterChip
      className={styles.filterToken}
      label={`Person: ${selectedPerson}`}
      onRemove={handleClearSelectedPerson}
      removeTitle={`Clear person filter ${selectedPerson}`}
    />
  ) : null

  const combinedExtraFilterChips = ownedPersonChip || extraFilterChips
    ? (
        <>
          {ownedPersonChip}
          {extraFilterChips}
        </>
      )
    : null

  const hasExtraFilters = Boolean(selectedPerson || extraFiltersActive)

  const searchBox = (
    <Controls
      summaryLabel={summaryLabel}
      visibleCount={visibleCount}
      totalCount={totalCount ?? items.length}
      keyword={keyword}
      parsedKeyword={parsedKeyword}
      activeVisitedFilterLabel={activeVisitedFilterLabel}
      mapFilterEnabled={mapFilterEnabled}
      searchOptions={searchOptions}
      selectedOption={selectedOption}
      inputValue={inputValue}
      canBookmark={canBookmark}
      detailActions={detailActions}
      BookmarkButton={BookmarkButton}
      onSubmit={handleSubmit}
      onSelectedOptionChange={handleSelectedOptionChange}
      onInputValueChange={handleInputValueChange}
      onRemoveKeywordToken={handleRemoveKeywordToken}
      onClear={handleClear}
      onClearVisitedFilter={handleClearVisitedFilter}
      onClearMapFilter={onClearMapFilter}
      extraFilterChips={combinedExtraFilterChips}
      extraFiltersActive={hasExtraFilters}
      onClearAll={handleClearAll}
      clearActionLabel={mapFilterEnabled || hasExtraFilters ? 'Clear all' : 'Clear'}
      clearActionTitle={mapFilterEnabled || hasExtraFilters
        ? 'Clear active filters and view adjacent photos'
        : 'Clear search and view adjacent photos'}
    />
  )

  return {
    filtered,
    keyword,
    setKeyword,
    searchBox,
    setVisibleCount,
    setDisplayedItems,
  }
}
