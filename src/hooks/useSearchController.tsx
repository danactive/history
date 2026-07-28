'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { buildClearedSearchRoutePath, buildSearchRoutePath } from '../lib/search-route-params'
import { resolveSearchSubmitIntent } from '../lib/search-submit-intent'
import { formatVisitedPlace, matchesVisitedPlace } from '../lib/visited-core'
import type { IndexedKeywords, VisitedPlace } from '../types/common'
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
}: {
  itemsRef: { current: ItemType[] }
  searchOptions: IndexedKeywords[]
  currentVisitedFilter: VisitedPlace | null
  fallbackSelectedOption?: IndexedKeywords | null
  refImageGallery?: React.RefObject<any>
  setMemoryIndex?: React.Dispatch<React.SetStateAction<number>>
  selectById?: (id: string, isClear?: boolean) => void
  mapFilterEnabled?: boolean
  onClearMapFilter?: (coordinates?: [number, number] | null) => void
  onClearExtraFilters?: () => void
  extraQueryParamsToClear?: string[]
  onStructuredOptionSubmit?: (option: IndexedKeywords) => boolean
  selectedPerson?: string | null
  ownedPersonFilter?: boolean
  knownPeople?: string[]
}) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const initialKeyword = searchParams?.get('keyword') ?? ''
  const initialVisitedCountry = searchParams?.get('visitedCountry') ?? ''
  const initialVisitedRegion = searchParams?.get('visitedRegion') ?? ''

  const [keyword, setKeyword] = useState<string>(initialKeyword)
  const [selectedOption, setSelectedOption] = useState<IndexedKeywords | null>(
    initialKeyword ? createKeywordOption(initialKeyword) : (fallbackSelectedOption ?? null),
  )
  const [inputValue, setInputValue] = useState<string>(
    initialKeyword || initialVisitedRegion || initialVisitedCountry || fallbackSelectedOption?.value || '',
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
    select?: string | null,
    nextVisitedPlace?: VisitedPlace | null,
    nextPerson?: string | null,
  ) => (
    buildSearchRoutePath({
      pathname,
      baseSearchParams: searchParams,
      keyword: nextKeyword,
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
    })

    if (intent.type === 'visited') {
      setKeyword('')
      setMemoryIndex?.(0)
      router.push(getNextPath('', null, intent.visitedPlace))
      return
    }

    if (intent.type === 'person') {
      if (ownedPersonFilter) {
        setKeyword('')
        setSelectedOption(intent.option ?? { label: intent.person, value: intent.person, filterKind: 'person' })
        setInputValue(intent.person)
        setMemoryIndex?.(0)
        router.push(getNextPath('', null, currentVisitedFilter, intent.person))
        return
      }

      if (intent.option && onStructuredOptionSubmit?.(intent.option)) {
        setMemoryIndex?.(0)
        return
      }

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
      setSelectedOption(createKeywordOption(intent.option.value))
      setInputValue(intent.option.value)
      setMemoryIndex?.(0)
      router.push(getNextPath(intent.option.value))
      return
    }

    if (intent.type === 'noop') {
      return
    }

    setKeyword(intent.keyword)
    setSelectedOption(createKeywordOption(intent.keyword))
    setInputValue(intent.keyword)
    setMemoryIndex?.(0)
    router.push(getNextPath(intent.keyword))
  }, [
    selectedOption,
    inputValue,
    setMemoryIndex,
    router,
    getNextPath,
    onStructuredOptionSubmit,
    ownedPersonFilter,
    currentVisitedFilter,
    knownPeople,
  ])

  const handleClear = useCallback(() => {
    const currentIndex = refImageGallery?.current?.getCurrentIndex?.() ?? 0
    const currentItem = itemsRef.current[currentIndex]
    const identifier = currentItem && hasFilename(currentItem) ? getPrimaryFilename(currentItem.filename) : ''

    if (selectById && identifier) {
      selectById(identifier, true)
    }

    setKeyword('')
    setSelectedOption(null)
    setInputValue('')

    router.replace(getNextPath('', identifier, null))
  }, [refImageGallery, itemsRef, selectById, router, getNextPath])

  const handleClearVisitedFilter = useCallback(() => {
    const currentIndex = refImageGallery?.current?.getCurrentIndex?.() ?? 0
    const currentItem = itemsRef.current[currentIndex]
    const identifier = currentItem && hasFilename(currentItem) ? getPrimaryFilename(currentItem.filename) : ''

    if (selectById && identifier) {
      selectById(identifier, true)
    }

    setSelectedOption(keyword ? createKeywordOption(keyword) : null)
    setInputValue(keyword)
    router.replace(getNextPath(keyword, identifier, null))
  }, [refImageGallery, itemsRef, selectById, keyword, router, getNextPath])

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

    router.replace(getNextPath(keyword, identifier, currentVisitedFilter, null))
  }, [currentVisitedFilter, getNextPath, itemsRef, keyword, refImageGallery, router, selectById, selectedPerson])

  const applyKeywordToUrl = useCallback((nextKeyword: string) => {
    setKeyword(nextKeyword)
    setSelectedOption(nextKeyword ? createKeywordOption(nextKeyword) : null)
    setInputValue(nextKeyword)
    router.replace(getNextPath(nextKeyword))
  }, [router, getNextPath])

  const handleClearAll = useCallback(() => {
    const currentIndex = refImageGallery?.current?.getCurrentIndex?.() ?? 0
    const currentItem = itemsRef.current[currentIndex]
    const identifier = currentItem && hasFilename(currentItem) ? getPrimaryFilename(currentItem.filename) : ''

    if (selectById && identifier) {
      selectById(identifier, true)
    }

    setKeyword('')
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
    setKeyword((previousKeyword) => (previousKeyword === nextKeyword ? previousKeyword : nextKeyword))

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
