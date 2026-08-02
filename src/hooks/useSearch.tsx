'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import {
  type Dispatch, type SetStateAction,
  useCallback,
  useMemo, useRef,
} from 'react'
import Controls from '../components/Search/Controls'
import { buildSearchOptions } from '../lib/domains/search'
import { getActiveFacetCounts } from '../lib/active-facets'
import { buildFilterMetadataFromLocations } from '../lib/filter-metadata-core'
import {
  parseKeywordQuery,
} from '../lib/search-filtering'
import { filterItemsByQuery, getConjunctiveFilterTerms, parseFilterQuery, type FilterQueryContext } from '../lib/filter-query'
import { filterItemsByMapBounds, type Bounds } from '../lib/map-filtering'
import { areMapBoundsEqual, mapBoundsSearchParam, parseMapBounds } from '../lib/map-filter-query'
import { Gallery, VisitedPlace } from '../types/common'
import type { SearchMetadata, SearchUiConfig } from '../types/pages'
import useBookmark from './useBookmark'
import useSearchController from './useSearchController'
import useSearchDetailActions from './useSearchDetailActions'
import useVisibleSearchState from './useVisibleSearchState'

export { parseKeywordQuery } from '../lib/search-filtering'

interface SearchableItem {
  corpus: string;
  city?: string;
  year?: string | null;
  photoDate?: string | null;
  persons?: { full: string }[] | null;
  search?: string | null;
  visitedPlace?: VisitedPlace | null;
  coordinates?: [number, number] | null;
}

type FilenameItem = SearchableItem & {
  filename: string | string[];
}

interface UseSearchProps<ItemType> extends SearchMetadata, SearchUiConfig {
  gallery: Gallery;
  items: ItemType[];
  memoryIndex?: number;
  setMemoryIndex?: Dispatch<SetStateAction<number>>;
  refImageGallery?: React.RefObject<any>;
  mapFilterEnabled?: boolean;
  mapBounds?: Bounds | null;
  onClearMapFilter?: (coordinates?: [number, number] | null) => void;
  selectById?: (id: string, isClear?: boolean) => void;
  trailingAction?: React.ReactNode;
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
  personOptions = [],
  tagOptions = [],
  activeFacetCounts: initialActiveFacetCounts,
  refImageGallery,
  mapFilterEnabled,
  mapBounds,
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
  const mapBoundsParam = searchParams?.get(mapBoundsSearchParam)
  const urlMapBounds = useMemo(() => parseMapBounds(mapBoundsParam), [mapBoundsParam])
  const mapScopedItems = useMemo(
    () => filterItemsByMapBounds(items, Boolean(mapFilterEnabled), mapBounds ?? null),
    [items, mapBounds, mapFilterEnabled],
  )

  const mapScopedMetadata = useMemo(
    () => mapFilterEnabled
      ? buildFilterMetadataFromLocations(mapScopedItems, buildSearchOptions(mapScopedItems))
      : null,
    [mapFilterEnabled, mapScopedItems],
  )

  const scopedIndexedKeywords = mapScopedMetadata?.indexedKeywords ?? indexedKeywords
  const scopedPersonOptions = mapScopedMetadata?.personOptions ?? personOptions
  const scopedTagOptions = mapScopedMetadata?.tagOptions ?? tagOptions

  const searchOptions = useMemo(
    () => buildSearchOptions(mapScopedItems, scopedIndexedKeywords),
    [mapScopedItems, scopedIndexedKeywords],
  )

  const knownPeople = useMemo(
    () => Array.from(new Set([
      ...scopedPersonOptions.map((option) => option.value),
      ...mapScopedItems.flatMap((item) => item.persons?.map((person) => person.full) ?? []),
    ])),
    [mapScopedItems, scopedPersonOptions],
  )

  const knownTags = useMemo(
    () => Array.from(new Set(scopedTagOptions.map((option) => option.value))),
    [scopedTagOptions],
  )

  const fallbackSelectedOption = useMemo(() => {
    const preferredPersonDetailsName = personDetailsName

    if (!preferredPersonDetailsName || searchParams?.get('query')) {
      return null
    }

    return searchOptions.find((option) => (
      option.value === preferredPersonDetailsName && !option.visitedPlace
    )) ?? {
      label: preferredPersonDetailsName,
      value: preferredPersonDetailsName,
    }
  }, [personDetailsName, searchOptions, searchParams])

  const visibleItemsRef = useRef<ItemType[]>(items)

  const {
    inputValue,
    keyword,
    selectedOption,
    setKeyword,
    applyKeywordToUrl,
    handleClear,
    handleClearAll,
    handleInputValueChange,
    handleSelectedOptionChange,
    handleSubmit,
  } = useSearchController<ItemType>({
    itemsRef: visibleItemsRef,
    searchOptions,
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
    ownedPersonFilter,
    knownPeople,
    knownTags,
  })

  const queryContext = useMemo<FilterQueryContext>(() => ({
    countries: Array.from(new Set(searchOptions.flatMap(option => option.visitedPlace ? [option.visitedPlace.country] : []))),
    regions: Array.from(new Set(searchOptions.flatMap(option => option.visitedPlace?.region ? [option.visitedPlace.region] : []))),
    people: knownPeople,
    tags: knownTags,
    keywords: scopedIndexedKeywords
      .filter(option => !option.filterKind || option.filterKind === 'keyword')
      .map(option => option.value),
  }), [knownPeople, knownTags, scopedIndexedKeywords, searchOptions])

  const filtered = useMemo(
    () => filterItemsByQuery(items, parseFilterQuery(keyword, queryContext)),
    [items, keyword, queryContext],
  )

  const visibleItems = useMemo(
    () => filterItemsByMapBounds(filtered, Boolean(mapFilterEnabled), mapBounds ?? null),
    [filtered, mapBounds, mapFilterEnabled],
  )

  const {
    itemsToUse,
    setDisplayedItems,
    visibleCount,
  } = useVisibleSearchState(visibleItems, visibleItemsRef)

  const parsedKeyword = useMemo(() => parseKeywordQuery(keyword), [keyword])
  const selectedQueryPerson = useMemo(
    () => getConjunctiveFilterTerms(keyword, queryContext).get('person') ?? null,
    [keyword, queryContext],
  )
  const { detailActions } = useSearchDetailActions({
    gallery,
    items,
    keyword,
    personDetailsName: selectedQueryPerson ?? personDetailsName,
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
    mapBounds,
  })

  const hasExtraFilters = Boolean(extraFiltersActive)
  const isUrlMapScope = Boolean(
    mapFilterEnabled
    && mapBounds
    && areMapBoundsEqual(mapBounds, urlMapBounds),
  )
  const visibleTotalCount = mapFilterEnabled && !isUrlMapScope
    ? mapScopedItems.length
    : totalCount ?? items.length
  const localActiveFacetCounts = useMemo(
    () => getActiveFacetCounts({
      items: mapScopedItems,
      query: keyword,
      context: queryContext,
      parsedQuery: parsedKeyword,
    }),
    [keyword, mapScopedItems, parsedKeyword, queryContext],
  )
  const activeFacetCounts = initialActiveFacetCounts && (!mapFilterEnabled || isUrlMapScope)
    ? initialActiveFacetCounts
    : localActiveFacetCounts

  const searchBox = (
    <Controls
      summaryLabel={summaryLabel}
      visibleCount={visibleCount}
      totalCount={visibleTotalCount}
      keyword={keyword}
      parsedKeyword={parsedKeyword}
      activeFacetCounts={activeFacetCounts.tokenCounts}
      advancedFacetCount={activeFacetCounts.advancedQueryCount}
      mapFilterEnabled={mapFilterEnabled}
      mapFacetCount={mapFilterEnabled ? visibleTotalCount : undefined}
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
      onClearMapFilter={onClearMapFilter}
      extraFilterChips={extraFilterChips}
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
    visibleItems,
    keyword,
    setKeyword,
    searchBox,
    setDisplayedItems,
  }
}
