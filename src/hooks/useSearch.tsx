'use client'

import { Button } from '@mui/joy'
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
    const coordinates = (currentItem as any)?.coordinates as [number, number] | null

    if (selectById && identifier) {
      selectById(identifier, true)
    }

    // Clear search state
    setKeyword('')
    setSelectedOption(null)
    setInputValue('')

    // Clear map filter - pass coordinates to preserve map position
    if (mapFilterEnabled && onClearMapFilter) {
      onClearMapFilter(coordinates)
    }

    // Update URL to reflect the selection (use filename for global uniqueness)
    router.replace(identifier ? `${pathname}?select=${identifier}` : pathname)
  }, [refImageGallery, displayedItems, filtered, selectById, mapFilterEnabled, onClearMapFilter, router, pathname])

  const canBookmark = Boolean(
    refImageGallery
    && selectById
    && itemsToUse.length
    && 'filename' in itemsToUse[0],
  )

  const { BookmarkButton } = useBookmark({
    refImageGallery,
    displayedItems: itemsToUse,
    pathname,
    currentIndex: memoryIndex,
    selectById,
  })

  const keywordResultLabel = keyword ? <> for &quot;{keyword}&quot;</> : null

  const searchBox = (
    <form onSubmit={handleSubmit}>
      <div className={styles.row}>
        <h3 className={styles.searchCount}>
          Search results {visibleCount} of {items.length}
          {keywordResultLabel}
        </h3>
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
        {(mapFilterEnabled || keyword) && (
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
