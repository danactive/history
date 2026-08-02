'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { buildClearedSearchRoutePath, buildSearchRoutePath } from '../lib/search-route-params'
import { resolveSearchSubmitIntent } from '../lib/search-submit-intent'
import { formatVisitedPlace, matchesVisitedPlace } from '../lib/visited-core'
import type { IndexedKeywords, VisitedPlace } from '../types/common'
import type { SearchControllerConfig } from '../types/pages'
import { getPrimaryFilename } from '../utils'

type SearchableItem = {
  filename?: string | string[]
}

function hasFilename(item: SearchableItem): item is SearchableItem & { filename: string | string[] } {
  return 'filename' in item && Boolean(item.filename)
}

export function createKeywordOption(value: string): IndexedKeywords {
  return {
    label: value,
    value,
    isCreateOption: true,
  }
}

export function createTagOption(value: string): IndexedKeywords {
  return {
    label: value,
    value,
    filterKind: 'tag',
    isCreateOption: true,
  }
}

export function createYearOption(value: string): IndexedKeywords {
  return {
    label: value,
    value,
    filterKind: 'year',
    isCreateOption: true,
  }
}

export default function useSearchController<ItemType>({
  itemsRef,
  searchOptions,
  currentVisitedFilter,
  fallbackSelectedOption,
  refImageGallery,
  setMemoryIndex,
  selectById,
  mapFilterEnabled,
  onClearMapFilter,
  onClearExtraFilters,
  extraQueryParamsToClear = [],
  onStructuredOptionSubmit,
  selectedPerson,
  ownedPersonFilter,
  knownPeople = [],
  knownTags = [],
}: SearchControllerConfig & {
  itemsRef: { current: ItemType[] }
  searchOptions: IndexedKeywords[]
  currentVisitedFilter: VisitedPlace | null
  fallbackSelectedOption?: IndexedKeywords | null
  refImageGallery?: React.RefObject<any>
  setMemoryIndex?: React.Dispatch<React.SetStateAction<number>>
  selectById?: (id: string, isClear?: boolean) => void
  mapFilterEnabled?: boolean
  onClearMapFilter?: (coordinates?: [number, number] | null) => void
  selectedPerson?: string | null
  knownPeople?: string[]
  knownTags?: string[]
}) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const initialKeyword = searchParams?.get('keyword') ?? ''
  const initialTag = searchParams?.get('tag') ?? ''
  const initialYear = searchParams?.get('year') ?? ''
  const initialVisitedCountry = searchParams?.get('visitedCountry') ?? ''
  const initialVisitedRegion = searchParams?.get('visitedRegion') ?? ''

  const [keyword, setKeyword] = useState<string>(initialKeyword)
  const [tag, setTag] = useState<string>(initialTag)
  const [year, setYear] = useState<string>(initialYear)
  const [selectedOption, setSelectedOption] = useState<IndexedKeywords | null>(
    initialYear
      ? createYearOption(initialYear)
      : initialTag
      ? createTagOption(initialTag)
      : initialKeyword
        ? createKeywordOption(initialKeyword)
        : (fallbackSelectedOption ?? null),
  )
  const [inputValue, setInputValue] = useState<string>(
    initialYear || initialTag || initialKeyword || initialVisitedRegion || initialVisitedCountry || fallbackSelectedOption?.value || '',
  )

  const activeVisitedOption = useMemo(() => {
    if (!currentVisitedFilter) return null

    return searchOptions.find((option) => {
      if (!option.visitedPlace) return false
      return matchesVisitedPlace(option.visitedPlace, currentVisitedFilter)
        && formatVisitedPlace(option.visitedPlace) === formatVisitedPlace(currentVisitedFilter)
    }) ?? {
      label: formatVisitedPlace(currentVisitedFilter),
      value: formatVisitedPlace(currentVisitedFilter),
      visitedPlace: currentVisitedFilter,
    }
  }, [currentVisitedFilter, searchOptions])

  const getNextPath = useCallback((
    nextKeyword: string,
    nextTag?: string | null,
    nextYear?: string | null,
    select?: string | null,
    nextVisitedPlace?: VisitedPlace | null,
    nextPerson?: string | null,
  ) => (
    buildSearchRoutePath({
      pathname,
      baseSearchParams: searchParams,
      keyword: nextKeyword,
      tag: nextTag,
      year: nextYear,
      person: nextPerson,
      select,
      visitedPlace: nextVisitedPlace,
    })
  ), [pathname, searchParams])

  const handleSelectedOptionChange = useCallback((nextOption: IndexedKeywords | null) => {
    if (!nextOption?.value) {
      setSelectedOption(null)
      return
    }

    setSelectedOption(nextOption)
  }, [])

  const handleInputValueChange = useCallback((nextInputValue: string) => {
    setInputValue(nextInputValue)
    setSelectedOption((previousOption) => {
      if (!previousOption) {
        return previousOption
      }

      return previousOption.value === nextInputValue ? previousOption : null
    })
  }, [])

  const handleSubmit = useCallback((event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const intent = resolveSearchSubmitIntent({
      selectedOption,
      inputValue,
      knownPeople,
      knownTags,
    })

    if (intent.type === 'visited') {
      setKeyword('')
      setTag('')
      setYear('')
      setMemoryIndex?.(0)
      router.push(getNextPath(keyword, tag, year, null, intent.visitedPlace))
      return
    }

    if (intent.type === 'person') {
      if (ownedPersonFilter) {
        setKeyword('')
        setTag('')
        setYear('')
        setSelectedOption(intent.option ?? { label: intent.person, value: intent.person, filterKind: 'person' })
        setInputValue(intent.person)
        setMemoryIndex?.(0)
        router.push(getNextPath('', '', '', null, currentVisitedFilter, intent.person))
        return
      }

      if (intent.option && onStructuredOptionSubmit?.(intent.option)) {
        setMemoryIndex?.(0)
        return
      }

      return
    }

    if (intent.type === 'tag') {
      setKeyword('')
      setTag(intent.tag)
      setYear('')
      setSelectedOption(intent.option ?? createTagOption(intent.tag))
      setInputValue(intent.tag)
      setMemoryIndex?.(0)
      router.push(getNextPath('', intent.tag, ''))
      return
    }

    if (intent.type === 'year') {
      setKeyword('')
      setTag('')
      setYear(intent.year)
      setSelectedOption(intent.option ?? createYearOption(intent.year))
      setInputValue(intent.year)
      setMemoryIndex?.(0)
      router.push(getNextPath('', '', intent.year))
      return
    }

    if (intent.type === 'structured') {
      if (onStructuredOptionSubmit?.(intent.option)) {
        setMemoryIndex?.(0)
        return
      }

      if (!ownedPersonFilter) {
        return
      }

      setKeyword(intent.option.value)
      setTag('')
      setYear('')
      setSelectedOption(createKeywordOption(intent.option.value))
      setInputValue(intent.option.value)
      setMemoryIndex?.(0)
      router.push(getNextPath(intent.option.value, '', ''))
      return
    }

    if (intent.type === 'noop') {
      return
    }

    setKeyword(intent.keyword)
    setTag('')
    setYear('')
    setSelectedOption(createKeywordOption(intent.keyword))
    setInputValue(intent.keyword)
    setMemoryIndex?.(0)
    router.push(getNextPath(intent.keyword, '', ''))
  }, [
    selectedOption,
    inputValue,
    keyword,
    tag,
    year,
    setMemoryIndex,
    router,
    getNextPath,
    onStructuredOptionSubmit,
    ownedPersonFilter,
    currentVisitedFilter,
    knownPeople,
    knownTags,
  ])

  const handleClear = useCallback(() => {
    const currentIndex = refImageGallery?.current?.getCurrentIndex?.() ?? 0
    const currentItem = itemsRef.current[currentIndex]
    const identifier = currentItem && hasFilename(currentItem) ? getPrimaryFilename(currentItem.filename) : ''

    if (selectById && identifier) {
      selectById(identifier, true)
    }

    setKeyword('')
    setTag('')
    setYear('')
    setSelectedOption(null)
    setInputValue('')

    router.replace(getNextPath('', '', '', identifier, null))
  }, [refImageGallery, itemsRef, selectById, router, getNextPath])

  const handleClearVisitedFilter = useCallback(() => {
    const currentIndex = refImageGallery?.current?.getCurrentIndex?.() ?? 0
    const currentItem = itemsRef.current[currentIndex]
    const identifier = currentItem && hasFilename(currentItem) ? getPrimaryFilename(currentItem.filename) : ''

    if (selectById && identifier) {
      selectById(identifier, true)
    }

    const nextSearchValue = year || tag || keyword
    setSelectedOption(year
      ? createYearOption(year)
      : tag
        ? createTagOption(tag)
        : keyword ? createKeywordOption(keyword) : null)
    setInputValue(nextSearchValue)
    router.replace(getNextPath(keyword, tag, year, identifier, null))
  }, [refImageGallery, itemsRef, selectById, keyword, tag, year, router, getNextPath])

  const handleClearSelectedPerson = useCallback(() => {
    if (!selectedPerson) {
      return
    }

    const currentIndex = refImageGallery?.current?.getCurrentIndex?.() ?? 0
    const currentItem = itemsRef.current[currentIndex]
    const identifier = currentItem && hasFilename(currentItem) ? getPrimaryFilename(currentItem.filename) : ''

    if (selectById && identifier) {
      selectById(identifier, true)
    }

    router.replace(getNextPath(keyword, tag, year, identifier, currentVisitedFilter, null))
  }, [currentVisitedFilter, getNextPath, itemsRef, keyword, tag, year, refImageGallery, router, selectById, selectedPerson])

  const applyKeywordToUrl = useCallback((nextKeyword: string) => {
    setKeyword(nextKeyword)
    setTag('')
    setYear('')
    setSelectedOption(nextKeyword ? createKeywordOption(nextKeyword) : null)
    setInputValue(nextKeyword)
    router.replace(getNextPath(nextKeyword, '', ''))
  }, [router, getNextPath])

  const handleClearAll = useCallback(() => {
    const currentIndex = refImageGallery?.current?.getCurrentIndex?.() ?? 0
    const currentItem = itemsRef.current[currentIndex]
    const identifier = currentItem && hasFilename(currentItem) ? getPrimaryFilename(currentItem.filename) : ''

    if (selectById && identifier) {
      selectById(identifier, true)
    }

    setKeyword('')
    setTag('')
    setYear('')
    setSelectedOption(null)
    setInputValue('')

    if (mapFilterEnabled) {
      onClearMapFilter?.()
    }
    onClearExtraFilters?.()

    router.replace(buildClearedSearchRoutePath({
      pathname,
      baseSearchParams: searchParams,
      select: identifier,
      extraQueryParamsToClear,
    }))
  }, [
    extraQueryParamsToClear,
    itemsRef,
    mapFilterEnabled,
    onClearExtraFilters,
    onClearMapFilter,
    pathname,
    refImageGallery,
    router,
    searchParams,
    selectById,
  ])

  useEffect(() => {
    const nextKeyword = searchParams?.get('keyword') ?? ''
    const nextTag = searchParams?.get('tag') ?? ''
    const nextYear = searchParams?.get('year') ?? ''
    setKeyword((previousKeyword) => (previousKeyword === nextKeyword ? previousKeyword : nextKeyword))
    setTag((previousTag) => (previousTag === nextTag ? previousTag : nextTag))
    setYear((previousYear) => (previousYear === nextYear ? previousYear : nextYear))

    if (nextYear) {
      setSelectedOption((previousOption) => {
        if (
          previousOption
          && previousOption.value === nextYear
          && previousOption.filterKind === 'year'
          && previousOption.isCreateOption
        ) {
          return previousOption
        }

        return createYearOption(nextYear)
      })
      setInputValue((previousInputValue) => (previousInputValue === nextYear ? previousInputValue : nextYear))
      return
    }

    if (nextTag) {
      setSelectedOption((previousOption) => {
        if (
          previousOption
          && previousOption.value === nextTag
          && previousOption.filterKind === 'tag'
          && previousOption.isCreateOption
        ) {
          return previousOption
        }

        return createTagOption(nextTag)
      })
      setInputValue((previousInputValue) => (previousInputValue === nextTag ? previousInputValue : nextTag))
      return
    }

    if (nextKeyword) {
      setSelectedOption((previousOption) => {
        if (
          previousOption
          && previousOption.value === nextKeyword
          && !previousOption.visitedPlace
          && previousOption.isCreateOption
        ) {
          return previousOption
        }

        return createKeywordOption(nextKeyword)
      })
      setInputValue((previousInputValue) => (previousInputValue === nextKeyword ? previousInputValue : nextKeyword))
      return
    }

    if (activeVisitedOption) {
      setSelectedOption((previousOption) => {
        const nextVisitedPlace = activeVisitedOption.visitedPlace

        if (
          nextVisitedPlace
          && previousOption
          && previousOption.value === activeVisitedOption.value
          && previousOption.visitedPlace
          && matchesVisitedPlace(previousOption.visitedPlace, nextVisitedPlace)
          && matchesVisitedPlace(nextVisitedPlace, previousOption.visitedPlace)
        ) {
          return previousOption
        }

        return activeVisitedOption
      })
      setInputValue((previousInputValue) => (
        previousInputValue === activeVisitedOption.value
          ? previousInputValue
          : activeVisitedOption.value
      ))
      return
    }

    if (fallbackSelectedOption) {
      setSelectedOption((previousOption) => {
        if (
          previousOption
          && previousOption.value === fallbackSelectedOption.value
          && !previousOption.visitedPlace
          && !previousOption.isCreateOption
        ) {
          return previousOption
        }

        return fallbackSelectedOption
      })
      setInputValue((previousInputValue) => (
        previousInputValue === fallbackSelectedOption.value
          ? previousInputValue
          : fallbackSelectedOption.value
      ))
      return
    }

    setSelectedOption((previousOption) => (previousOption === null ? previousOption : null))
    setInputValue((previousInputValue) => (previousInputValue === '' ? previousInputValue : ''))
  }, [activeVisitedOption, fallbackSelectedOption, searchParams])

  return {
    inputValue,
    keyword,
    tag,
    year,
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
  }
}
