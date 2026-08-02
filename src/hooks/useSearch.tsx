'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import {
  type Dispatch, type SetStateAction,
  useCallback,
  useMemo, useRef,
} from 'react'
import Controls from '../components/Search/Controls'
import { buildSearchOptions } from '../lib/domains/search'
import {
  parseKeywordQuery,
} from '../lib/search-filtering'
import { filterItemsByQuery, getConjunctiveFilterTerms, parseFilterQuery, type FilterQueryContext } from '../lib/filter-query'
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
  const searchOptions = useMemo(
    () => buildSearchOptions(items, indexedKeywords),
    [items, indexedKeywords],
  )

  const knownPeople = useMemo(
    () => Array.from(new Set([
      ...personOptions.map((option) => option.value),
      ...items.flatMap((item) => item.persons?.map((person) => person.full) ?? []),
    ])),
    [items, personOptions],
  )

  const knownTags = useMemo(
    () => Array.from(new Set(tagOptions.map((option) => option.value))),
    [tagOptions],
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
    keywords: indexedKeywords
      .filter(option => !option.filterKind || option.filterKind === 'keyword')
      .map(option => option.value),
  }), [indexedKeywords, knownPeople, knownTags, searchOptions])

  const filtered = useMemo(
    () => filterItemsByQuery(items, parseFilterQuery(keyword, queryContext)),
    [items, keyword, queryContext],
  )

  const {
    itemsToUse,
    setDisplayedItems,
    setVisibleCount,
    visibleCount,
  } = useVisibleSearchState(filtered, items, visibleItemsRef)

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
  })

  const hasExtraFilters = Boolean(extraFiltersActive)

  const searchBox = (
    <Controls
      summaryLabel={summaryLabel}
      visibleCount={visibleCount}
      totalCount={totalCount ?? items.length}
      keyword={keyword}
      parsedKeyword={parsedKeyword}
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
    keyword,
    setKeyword,
    searchBox,
    setVisibleCount,
    setDisplayedItems,
  }
}
