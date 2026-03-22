'use client'

import { Button, Chip, Stack } from '@mui/joy'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import {
  type Dispatch, type SetStateAction,
  useCallback,
  useEffect, useMemo, useRef, useState,
} from 'react'
import AutoComplete from '../components/ComboBox'
import { IndexedKeywords } from '../types/common'
import useBookmark from './useBookmark'
import { matchCorpus } from '../utils/search'
import styles from './search.module.css'

interface ServerSideItem {
  corpus: string;
}

interface UseSearchProps<ItemType> {
  items: ItemType[];
  memoryIndex?: number;
  setMemoryIndex?: Dispatch<SetStateAction<number>>;
  indexedKeywords?: IndexedKeywords[];
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
  refImageGallery,
  mapFilterEnabled,
  onClearMapFilter,
  selectById,
}: UseSearchProps<ItemType>) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const initialKeyword = searchParams?.get('keyword') ?? ''
  const [keyword, setKeyword] = useState<string>(initialKeyword)
  const [selectedOption, setSelectedOption] = useState<IndexedKeywords | null>(
    initialKeyword ? { label: initialKeyword, value: initialKeyword } : null,
  )
  const [inputValue, setInputValue] = useState<string>(initialKeyword)
  const [displayedItems, setDisplayedItems] = useState<ItemType[]>(items)
  const parsedKeyword = useMemo(() => parseKeywordQuery(keyword), [keyword])

  const filtered = useMemo(() => {
    if (!keyword) return items
    return items.filter((item) => matchCorpus(item.corpus, keyword))
  }, [items, keyword])

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
    const newKeyword = selectedOption?.value ?? ''
    setKeyword(newKeyword)
    setMemoryIndex?.(0)
    router.push(`${pathname}?keyword=${encodeURIComponent(newKeyword)}`)
  }, [selectedOption, setMemoryIndex, router, pathname])

  const handleClear = useCallback(() => {
    // Get current photo ID from displayed items (respects map filter)
    const currentIndex = refImageGallery?.current?.getCurrentIndex?.() ?? 0
    const currentItem = itemsToUse[currentIndex]
    const identifier = currentItem
      ? (Array.isArray((currentItem as any).filename)
          ? (currentItem as any).filename[0]
          : (currentItem as any).filename)
      : null

    if (selectById && identifier) {
      selectById(identifier, true)
    }

    // Clear search state
    setKeyword('')
    setSelectedOption(null)
    setInputValue('')

    // Update URL to reflect the selection (use filename for global uniqueness)
    router.replace(identifier ? `${pathname}?select=${identifier}` : pathname)
  }, [refImageGallery, displayedItems, filtered, selectById, router, pathname])

  const applyKeywordToUrl = useCallback((nextKeyword: string) => {
    setKeyword(nextKeyword)
    setSelectedOption(nextKeyword ? { label: nextKeyword, value: nextKeyword } : null)
    setInputValue(nextKeyword)
    router.replace(nextKeyword ? `${pathname}?keyword=${encodeURIComponent(nextKeyword)}` : pathname)
  }, [router, pathname])

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
          options={indexedKeywords}
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
        {keyword && (
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

  // Track previous search params value to avoid circular dependency
  const prevSearchParamsValue = useRef<string>(initialKeyword)

  useEffect(() => {
    const value = searchParams?.get('keyword') ?? ''
    if (value !== prevSearchParamsValue.current) {
      prevSearchParamsValue.current = value
      setKeyword(value)
      setSelectedOption(value ? { label: value, value } : null)
      setInputValue(value)
    }
  }, [searchParams])

  return {
    filtered,
    keyword,
    setKeyword,
    searchBox,
    setVisibleCount: setVisibleCountStable,
    setDisplayedItems,
  }
}
