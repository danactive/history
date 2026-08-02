'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { formatFilterQuery, parseFilterQuery, type FilterQueryContext, type FilterQueryNode } from '../lib/filter-query'
import { buildClearedSearchRoutePath, buildSearchRoutePath } from '../lib/search-route-params'
import { resolveSearchSubmitIntent } from '../lib/search-submit-intent'
import type { IndexedKeywords } from '../types/common'
import type { SearchControllerConfig } from '../types/pages'
import { getPrimaryFilename } from '../utils'

type SearchableItem = {
  filename?: string | string[]
}

function hasFilename(item: SearchableItem): item is SearchableItem & { filename: string | string[] } {
  return 'filename' in item && Boolean(item.filename)
}

export function createKeywordOption(value: string): IndexedKeywords {
  return { label: value, value, isCreateOption: true }
}

function formatSelectionQuery(intent: ReturnType<typeof resolveSearchSubmitIntent>): FilterQueryNode | null {
  switch (intent.type) {
    case 'visited': {
      const country = { type: 'term' as const, kind: 'country' as const, value: intent.visitedPlace.country }
      if (!intent.visitedPlace.region) return country
      return {
        type: 'and',
        children: [country, { type: 'term', kind: 'region', value: intent.visitedPlace.region }],
      }
    }
    case 'person':
      return { type: 'term', kind: 'person', value: intent.person }
    case 'tag':
      return { type: 'term', kind: 'tag', value: intent.tag }
    case 'year':
      return { type: 'term', kind: 'year', value: intent.year }
    default:
      return null
  }
}

function combineAnd(currentQuery: string, selection: FilterQueryNode, context: FilterQueryContext) {
  const current = parseFilterQuery(currentQuery, context)
  return formatFilterQuery(current ? { type: 'and', children: [current, selection] } : selection)
}

export default function useSearchController<ItemType>({
  itemsRef,
  searchOptions,
  fallbackSelectedOption,
  refImageGallery,
  setMemoryIndex,
  selectById,
  mapFilterEnabled,
  onClearMapFilter,
  onClearExtraFilters,
  extraQueryParamsToClear = [],
  onStructuredOptionSubmit,
  ownedPersonFilter,
  knownPeople = [],
  knownTags = [],
}: SearchControllerConfig & {
  itemsRef: { current: ItemType[] }
  searchOptions: IndexedKeywords[]
  fallbackSelectedOption?: IndexedKeywords | null
  refImageGallery?: React.RefObject<any>
  setMemoryIndex?: React.Dispatch<React.SetStateAction<number>>
  selectById?: (id: string, isClear?: boolean) => void
  mapFilterEnabled?: boolean
  onClearMapFilter?: (coordinates?: [number, number] | null) => void
  knownPeople?: string[]
  knownTags?: string[]
}) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const initialQuery = searchParams?.get('query') ?? ''

  const [query, setQuery] = useState(initialQuery)
  const [selectedOption, setSelectedOption] = useState<IndexedKeywords | null>(
    initialQuery ? createKeywordOption(initialQuery) : fallbackSelectedOption ?? null,
  )
  const [inputValue, setInputValue] = useState(initialQuery || fallbackSelectedOption?.value || '')

  const queryContext = useMemo<FilterQueryContext>(() => ({
    countries: Array.from(new Set(searchOptions.flatMap(option => option.visitedPlace ? [option.visitedPlace.country] : []))),
    regions: Array.from(new Set(searchOptions.flatMap(option => option.visitedPlace?.region ? [option.visitedPlace.region] : []))),
    people: knownPeople,
    tags: knownTags,
  }), [knownPeople, knownTags, searchOptions])

  const getNextPath = useCallback((nextQuery: string, select?: string | null) => (
    buildSearchRoutePath({ pathname, baseSearchParams: searchParams, query: nextQuery, select })
  ), [pathname, searchParams])

  const handleSelectedOptionChange = useCallback((nextOption: IndexedKeywords | null) => {
    setSelectedOption(nextOption?.value ? nextOption : null)
  }, [])

  const handleInputValueChange = useCallback((nextInputValue: string) => {
    setInputValue(nextInputValue)
    setSelectedOption((previousOption) => previousOption?.value === nextInputValue ? previousOption : null)
  }, [])

  const applyQuery = useCallback((nextQuery: string, replace = false) => {
    const normalizedQuery = formatFilterQuery(parseFilterQuery(nextQuery, queryContext))
    setQuery(normalizedQuery)
    setSelectedOption(normalizedQuery ? createKeywordOption(normalizedQuery) : null)
    setInputValue(normalizedQuery)
    setMemoryIndex?.(0)
    const nextPath = getNextPath(normalizedQuery)
    if (replace) router.replace(nextPath)
    else router.push(nextPath)
  }, [getNextPath, queryContext, router, setMemoryIndex])

  const handleSubmit = useCallback((event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const intent = resolveSearchSubmitIntent({ selectedOption, inputValue, knownPeople, knownTags })
    const selection = formatSelectionQuery(intent)

    if (intent.type === 'structured') {
      if (onStructuredOptionSubmit?.(intent.option)) {
        setMemoryIndex?.(0)
        return
      }
      if (ownedPersonFilter) {
        applyQuery(intent.option.value)
      }
      return
    }

    if (intent.type === 'person' && !ownedPersonFilter) {
      if (intent.option && onStructuredOptionSubmit?.(intent.option)) setMemoryIndex?.(0)
      return
    }

    if (selection) {
      applyQuery(combineAnd(query, selection, queryContext))
      return
    }

    if (intent.type === 'keyword') {
      applyQuery(intent.keyword)
    }
  }, [
    applyQuery,
    inputValue,
    knownPeople,
    knownTags,
    onStructuredOptionSubmit,
    ownedPersonFilter,
    query,
    queryContext,
    selectedOption,
    setMemoryIndex,
  ])

  const getSelectedIdentifier = useCallback(() => {
    const currentIndex = refImageGallery?.current?.getCurrentIndex?.() ?? 0
    const currentItem = itemsRef.current[currentIndex]
    const identifier = currentItem && hasFilename(currentItem) ? getPrimaryFilename(currentItem.filename) : ''
    if (selectById && identifier) selectById(identifier, true)
    return identifier
  }, [itemsRef, refImageGallery, selectById])

  const handleClear = useCallback(() => {
    const identifier = getSelectedIdentifier()
    setQuery('')
    setSelectedOption(null)
    setInputValue('')
    router.replace(getNextPath('', identifier))
  }, [getNextPath, getSelectedIdentifier, router])

  const applyKeywordToUrl = useCallback((nextKeyword: string) => {
    applyQuery(nextKeyword, true)
  }, [applyQuery])

  const handleClearAll = useCallback(() => {
    const identifier = getSelectedIdentifier()
    setQuery('')
    setSelectedOption(null)
    setInputValue('')
    if (mapFilterEnabled) onClearMapFilter?.()
    onClearExtraFilters?.()
    router.replace(buildClearedSearchRoutePath({
      pathname,
      baseSearchParams: searchParams,
      select: identifier,
      extraQueryParamsToClear,
    }))
  }, [extraQueryParamsToClear, getSelectedIdentifier, mapFilterEnabled, onClearExtraFilters, onClearMapFilter, pathname, router, searchParams])

  useEffect(() => {
    const nextQuery = searchParams?.get('query') ?? ''
    setQuery(previousQuery => previousQuery === nextQuery ? previousQuery : nextQuery)

    if (nextQuery) {
      const nextOption = createKeywordOption(nextQuery)
      setSelectedOption(previousOption => previousOption?.value === nextQuery && previousOption.isCreateOption ? previousOption : nextOption)
      setInputValue(previousInputValue => previousInputValue === nextQuery ? previousInputValue : nextQuery)
      return
    }

    if (fallbackSelectedOption) {
      setSelectedOption(previousOption => previousOption?.value === fallbackSelectedOption.value ? previousOption : fallbackSelectedOption)
      setInputValue(previousInputValue => previousInputValue === fallbackSelectedOption.value ? previousInputValue : fallbackSelectedOption.value)
      return
    }

    setSelectedOption(previousOption => previousOption === null ? previousOption : null)
    setInputValue(previousInputValue => previousInputValue === '' ? previousInputValue : '')
  }, [fallbackSelectedOption, searchParams])

  return {
    inputValue,
    keyword: query,
    selectedOption,
    setKeyword: setQuery,
    applyKeywordToUrl,
    handleClear,
    handleClearAll,
    handleClearSelectedPerson: handleClear,
    handleClearVisitedFilter: handleClear,
    handleInputValueChange,
    handleSelectedOptionChange,
    handleSubmit,
  }
}
