'use client'

import { Button, Chip, Stack } from '@mui/joy'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import {
  type Dispatch, type SetStateAction,
  useCallback,
  useEffect, useMemo, useState,
} from 'react'
import AutoComplete from '../components/ComboBox'
import {
  buildVisitedKeywordOptions,
  buildVisitedRegionCountryIndex,
  formatVisitedPlace,
  getVisitedPlace,
  matchesVisitedPlace,
} from '../lib/visited-core'
import { IndexedKeywords, VisitedPlace } from '../types/common'
import { getPrimaryFilename } from '../utils'
import { matchCorpus } from '../utils/search'
import styles from './search.module.css'
import useBookmark from './useBookmark'

interface ServerSideItem {
  corpus: string;
  city?: string;
  filename: string | string[];
  photoDate?: string | null;
  visitedPlace?: VisitedPlace | null;
}

interface UseSearchProps<ItemType> {
  items: ItemType[];
  memoryIndex?: number;
  setMemoryIndex?: Dispatch<SetStateAction<number>>;
  indexedKeywords?: IndexedKeywords[];
  visitedFilterLabel?: string | null;
  refImageGallery?: React.RefObject<any>;
  mapFilterEnabled?: boolean;
  onClearMapFilter?: (coordinates?: [number, number] | null) => void;
  selectById?: (id: string, isClear?: boolean) => void;
}

type QueryMode = 'AND' | 'OR' | null
type ParsedKeywordQuery = {
  mode: QueryMode
  tokens: string[]
  isAdvanced: boolean
}

export function parseKeywordQuery(rawKeyword: string): ParsedKeywordQuery {
  const keyword = rawKeyword.trim()
  if (!keyword) return { mode: null, tokens: [], isAdvanced: false }

  const hasAnd = keyword.includes('&&')
  const hasOr = keyword.includes('||')
  const hasGrouping = keyword.includes('(') || keyword.includes(')')

  // Keep complex expressions as a single "Advanced query" chip.
  if (hasGrouping || (hasAnd && hasOr)) {
    return { mode: null, tokens: [keyword], isAdvanced: true }
  }

  if (hasAnd) {
    const tokens = keyword.split('&&').map(t => t.trim()).filter(Boolean)
    return tokens.length > 0
      ? { mode: 'AND', tokens, isAdvanced: false }
      : { mode: null, tokens: [keyword], isAdvanced: true }
  }

  if (hasOr) {
    const tokens = keyword.split('||').map(t => t.trim()).filter(Boolean)
    return tokens.length > 0
      ? { mode: 'OR', tokens, isAdvanced: false }
      : { mode: null, tokens: [keyword], isAdvanced: true }
  }

  return { mode: null, tokens: [keyword], isAdvanced: false }
}

export default function useSearch<ItemType extends ServerSideItem>({
  items,
  memoryIndex,
  setMemoryIndex,
  indexedKeywords = [],
  visitedFilterLabel,
  refImageGallery,
  mapFilterEnabled,
  onClearMapFilter,
  selectById,
}: UseSearchProps<ItemType>) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const initialKeyword = searchParams?.get('keyword') ?? ''
  const initialVisitedCountry = searchParams?.get('visitedCountry') ?? ''
  const initialVisitedRegion = searchParams?.get('visitedRegion') ?? ''
  const [keyword, setKeyword] = useState<string>(initialKeyword)
  const [selectedOption, setSelectedOption] = useState<IndexedKeywords | null>(
    initialKeyword ? { label: initialKeyword, value: initialKeyword } : null,
  )
  const [inputValue, setInputValue] = useState<string>(initialKeyword || initialVisitedRegion || initialVisitedCountry)
  const [displayedItems, setDisplayedItems] = useState<ItemType[]>(items)
  const parsedKeyword = useMemo(() => parseKeywordQuery(keyword), [keyword])

  const currentVisitedFilter = useMemo<VisitedPlace | null>(() => {
    if (!initialVisitedCountry) {
      return null
    }

    return {
      country: initialVisitedCountry,
      region: initialVisitedRegion || null,
    }
  }, [initialVisitedCountry, initialVisitedRegion])

  const visitedOptions = useMemo(
    () => buildVisitedKeywordOptions(
      items
        .filter((item): item is ItemType & Required<Pick<ServerSideItem, 'city' | 'filename'>> => (
          typeof item.city === 'string' && Boolean(item.filename)
        ))
        .map((item) => ({
          city: item.city,
          filename: item.filename,
          photoDate: item.photoDate ?? null,
        })),
    ),
    [items],
  )

  const searchOptions = useMemo(() => {
    const options = new Map<string, IndexedKeywords>()

    indexedKeywords.forEach((option) => {
      options.set(option.value, option)
    })

    visitedOptions.forEach((option) => {
      options.set(option.value, option)
    })

    return [...options.values()].sort((left, right) => left.value.localeCompare(right.value))
  }, [indexedKeywords, visitedOptions])

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

  const getCurrentParams = useCallback(() => {
    const serializedParams = typeof searchParams?.toString === 'function'
      ? searchParams.toString()
      : ''
    const params = serializedParams && serializedParams !== '[object Object]'
      ? new URLSearchParams(serializedParams)
      : new URLSearchParams()

    if (params.size > 0) {
      return params
    }

    ['keyword', 'select', 'visitedCountry', 'visitedRegion'].forEach((key) => {
      const value = searchParams?.get(key)
      if (value) {
        params.set(key, value)
      }
    })

    return params
  }, [searchParams])

  const getNextPath = useCallback((nextKeyword: string, select?: string | null, nextVisitedPlace?: VisitedPlace | null) => {
    const params = getCurrentParams()

    if (nextKeyword) {
      params.set('keyword', nextKeyword)
    } else {
      params.delete('keyword')
    }

    if (select) {
      params.set('select', select)
    } else {
      params.delete('select')
    }

    if (nextVisitedPlace === null) {
      params.delete('visitedCountry')
      params.delete('visitedRegion')
    } else if (nextVisitedPlace) {
      params.set('visitedCountry', nextVisitedPlace.country)
      if (nextVisitedPlace.region) {
        params.set('visitedRegion', nextVisitedPlace.region)
      } else {
        params.delete('visitedRegion')
      }
    }

    const query = params.toString()
    return query ? `${pathname}?${query}` : pathname
  }, [getCurrentParams, pathname])

  const visitedFiltered = useMemo(() => {
    if (!currentVisitedFilter) return items

    const regionCountryIndex = buildVisitedRegionCountryIndex(
      items.filter((item): item is ItemType & Required<Pick<ServerSideItem, 'city'>> => typeof item.city === 'string'),
    )

    return items.filter((item) => {
      const itemVisitedPlace = item.visitedPlace ?? (typeof item.city === 'string'
        ? getVisitedPlace({ city: item.city }, regionCountryIndex)
        : null)

      return matchesVisitedPlace(itemVisitedPlace, currentVisitedFilter)
    })
  }, [currentVisitedFilter, items])

  const filtered = useMemo(() => {
    if (!keyword) return visitedFiltered
    return visitedFiltered.filter((item) => matchCorpus(item.corpus, keyword))
  }, [visitedFiltered, keyword])

  // Count of currently visible thumbnails (consumer can override this if needed)
  const [visibleCount, setVisibleCount] = useState<number>(filtered.length)

  // Make setVisibleCount stable to prevent useEffect loops
  const setVisibleCountStable = useCallback((count: number) => {
    setVisibleCount((prev) => (prev === count ? prev : count))
  }, [])

  // Sync visibleCount when filtered items change (avoids state-update-during-render)
  useEffect(() => {
    setVisibleCount((prev) => (prev === filtered.length ? prev : filtered.length))
  }, [filtered.length])

  const itemsToUse = useMemo(
    () => (displayedItems.length ? displayedItems : filtered),
    [displayedItems, filtered],
  )

  const handleSubmit = useCallback((event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (selectedOption?.visitedPlace) {
      setKeyword('')
      setMemoryIndex?.(0)
      router.push(getNextPath('', null, selectedOption.visitedPlace))
      return
    }

    const newKeyword = selectedOption?.value ?? ''
    setKeyword(newKeyword)
    setMemoryIndex?.(0)
    router.push(getNextPath(newKeyword))
  }, [selectedOption, setMemoryIndex, router, getNextPath])

  const handleClear = useCallback(() => {
    // Get current photo ID from displayed items (respects map filter)
    const currentIndex = refImageGallery?.current?.getCurrentIndex?.() ?? 0
    const currentItem = itemsToUse[currentIndex]
    const identifier = getPrimaryFilename(currentItem.filename)

    if (selectById && identifier) {
      selectById(identifier, true)
    }

    // Clear search state
    setKeyword('')
    setSelectedOption(null)
    setInputValue('')

    // Update URL to reflect the selection (use filename for global uniqueness)
    router.replace(getNextPath('', identifier, null))
  }, [refImageGallery, displayedItems, filtered, selectById, router, getNextPath])

  const handleClearVisitedFilter = useCallback(() => {
    const currentIndex = refImageGallery?.current?.getCurrentIndex?.() ?? 0
    const currentItem = itemsToUse[currentIndex]
    const identifier = getPrimaryFilename(currentItem.filename)

    if (selectById && identifier) {
      selectById(identifier, true)
    }

    setSelectedOption(keyword ? { label: keyword, value: keyword } : null)
    setInputValue(keyword)
    router.replace(getNextPath(keyword, identifier, null))
  }, [refImageGallery, itemsToUse, selectById, keyword, router, getNextPath])

  const applyKeywordToUrl = useCallback((nextKeyword: string) => {
    setKeyword(nextKeyword)
    setSelectedOption(nextKeyword ? { label: nextKeyword, value: nextKeyword } : null)
    setInputValue(nextKeyword)
    router.replace(getNextPath(nextKeyword))
  }, [router, getNextPath])

  const handleRemoveKeywordToken = useCallback((tokenIndex: number) => {
    if (parsedKeyword.isAdvanced) {
      handleClear()
      return
    }

    const remaining = parsedKeyword.tokens.filter((_, i) => i !== tokenIndex)
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
    && 'filename' in itemsToUse[0],
  )

  const { BookmarkButton } = useBookmark({
    refImageGallery,
    displayedItems: itemsToUse,
    pathname,
    currentIndex: memoryIndex,
  })

  const keywordResultLabel = keyword ? <> for &quot;{keyword}&quot;</> : null
  const activeVisitedFilterLabel = currentVisitedFilter
    ? formatVisitedPlace(currentVisitedFilter)
    : visitedFilterLabel

  const searchBox = (
    <form onSubmit={handleSubmit}>
      <div className={styles.row}>
        <h3 className={styles.searchCount}>
          Search results {visibleCount} of {items.length}
          {keywordResultLabel}
        </h3>
        {keyword && (
          <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
            {parsedKeyword.mode && (
              <Chip size="sm" color="primary" variant="outlined">
                {parsedKeyword.mode}
              </Chip>
            )}
            {parsedKeyword.isAdvanced ? (
              <Stack direction="row" spacing={0.25} sx={{ alignItems: 'center' }}>
                <Chip size="sm" color="primary" variant="soft">
                  Advanced query
                </Chip>
                <Button
                  type="button"
                  size="sm"
                  variant="plain"
                  onClick={handleClear}
                  title="Clear search and view adjacent photos"
                  aria-label="Clear advanced query"
                >
                  ×
                </Button>
              </Stack>
            ) : (
              parsedKeyword.tokens.map((token, idx) => (
                <Stack key={`${token}-${idx}`} direction="row" spacing={0.25} sx={{ alignItems: 'center' }}>
                  <Chip size="sm" color="primary" variant="soft">
                    {token}
                  </Chip>
                  <Button
                    type="button"
                    size="sm"
                    variant="plain"
                    onClick={() => handleRemoveKeywordToken(idx)}
                    title={`Remove keyword token ${token}`}
                    aria-label={`Remove keyword token ${token}`}
                  >
                    ×
                  </Button>
                </Stack>
              ))
            )}
          </Stack>
        )}
        {activeVisitedFilterLabel && (
          <Stack direction="row" spacing={0.25} sx={{ alignItems: 'center' }}>
            <Chip size="sm" color="primary" variant="soft">
              {activeVisitedFilterLabel}
            </Chip>
            <Button
              type="button"
              size="sm"
              variant="plain"
              onClick={handleClearVisitedFilter}
              title={`Clear visited filter ${activeVisitedFilterLabel}`}
              aria-label={`Clear visited filter ${activeVisitedFilterLabel}`}
            >
              ×
            </Button>
          </Stack>
        )}
        {mapFilterEnabled && (
          <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
            <Chip size="sm" color="primary" variant="soft">
              Map filter
            </Chip>
            <Button
              type="button"
              size="sm"
              variant="plain"
              onClick={() => onClearMapFilter?.()}
              title="Clear map filter"
              aria-label="Clear map filter"
            >
              ×
            </Button>
          </Stack>
        )}
        <AutoComplete
          className={styles.autocomplete}
          options={searchOptions}
          onChange={setSelectedOption}
          value={selectedOption}
          inputValue={inputValue}
          onInputChange={setInputValue}
        />
        <Button
          type="submit"
          title="`&&` is AND; `||` is OR; for example `breakfast||lunch`"
          color="neutral"
        >
          Filter
        </Button>
        {(keyword || activeVisitedFilterLabel) && (
          <Button
            type="button"
            onClick={handleClear}
            color="primary"
            variant="soft"
            title="Clear search and view adjacent photos"
          >
            Clear
          </Button>
        )}
        {canBookmark && <BookmarkButton />}
      </div>
    </form>
  )

  useEffect(() => {
    const nextKeyword = searchParams?.get('keyword') ?? ''
    setKeyword((previousKeyword) => (previousKeyword === nextKeyword ? previousKeyword : nextKeyword))

    if (nextKeyword) {
      setSelectedOption((previousOption) => {
        if (
          previousOption
          && previousOption.value === nextKeyword
          && !previousOption.visitedPlace
        ) {
          return previousOption
        }

        return { label: nextKeyword, value: nextKeyword }
      })
      setInputValue((previousInputValue) => (previousInputValue === nextKeyword ? previousInputValue : nextKeyword))
      return
    }

    if (activeVisitedOption) {
      setSelectedOption((previousOption) => {
        const nextVisitedPlace = activeVisitedOption.visitedPlace

        if (
          nextVisitedPlace
          &&
          previousOption
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

    setSelectedOption((previousOption) => (previousOption === null ? previousOption : null))
    setInputValue((previousInputValue) => (previousInputValue === '' ? previousInputValue : ''))
  }, [activeVisitedOption, searchParams])

  return {
    filtered,
    keyword,
    setKeyword,
    searchBox,
    setVisibleCount: setVisibleCountStable,
    setDisplayedItems,
  }
}
