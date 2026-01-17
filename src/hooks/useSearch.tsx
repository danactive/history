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
import styles from './search.module.css'

interface ServerSideItem {
  corpus: string;
}

interface UseSearchProps<ItemType> {
  items: ItemType[];
  setMemoryIndex?: Dispatch<SetStateAction<number>>;
  indexedKeywords?: IndexedKeywords[];
  refImageGallery?: React.RefObject<any>;
}

export default function useSearch<ItemType extends ServerSideItem>({
  items,
  setMemoryIndex,
  indexedKeywords = [],
  refImageGallery,
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
  const [filteredItems, setFilteredItems] = useState<ItemType[]>(items)
  const [displayedItems, setDisplayedItems] = useState<ItemType[]>(items)

  // Count of currently visible thumbnails (consumer can override this if needed)
  const [visibleCount, setVisibleCount] = useState<number>(items.length)

  // Make setVisibleCount stable to prevent useEffect loops
  const setVisibleCountStable = useCallback((count: number) => {
    setVisibleCount((prev) => (prev === count ? prev : count))
  }, [])

  const AND_OPERATOR = '&&'
  const OR_OPERATOR = '||'

  const normalize = (text: string) =>
    text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()

  /**
   * Matches a search keyword against a corpus string using boolean operators.
   * Supports AND (&&) and OR (||) operators with single-level parentheses.
   *
   * Simple searches (words separated by spaces) are treated as implicit AND operations.
   * For example, "apple banana" matches text containing both "apple" AND "banana".
   *
   * Limitation: Nested parentheses are NOT supported. Expressions like `((a || b) && c)`
   * or `(a && (b || c))` will not be evaluated correctly. Only simple single-level
   * parentheses work: `(a || b) && c` or `a && (b || c)`.
   *
   * @param {string} corpus - The text to search within
   * @param {string} kword - The search keyword with optional boolean operators (&&, ||) and parentheses
   * @returns {boolean} True if the keyword matches the corpus
   *
   * @example
   * ```ts
   * matchCorpus('apple banana', 'apple banana') // true (implicit AND)
   * matchCorpus('apple banana', 'apple && banana') // true
   * matchCorpus('orange banana', 'apple || orange') // true
   * matchCorpus('apple banana', '(apple || orange) && banana') // true
   * matchCorpus('text', '((a || b) && c)') // NOT SUPPORTED - will not work correctly
   * ```
   */
  const matchCorpus = (corpus: string, kword: string): boolean => {
    const normalizedCorpus = normalize(corpus)
    const normalizedKeyword = normalize(kword)

    const evaluateExpression = (expr: string): boolean => {
      // If there's no AND or OR operator, treat spaces as implicit AND
      if (!expr.includes(AND_OPERATOR) && !expr.includes(OR_OPERATOR)) {
        const terms = expr.split(/\s+/).filter(t => t.length > 0)
        return terms.every((term) => normalizedCorpus.includes(term.trim()))
      }

      // If there's no AND operator, evaluate as OR expression
      if (!expr.includes(AND_OPERATOR)) {
        return expr
          .split(OR_OPERATOR)
          .some((term) => normalizedCorpus.includes(term.trim()))
      }

      // Split by AND carefully, preserving content inside parentheses
      const andParts: string[] = []
      let currentPart = ''
      let depth = 0

      for (let i = 0; i < expr.length; i++) {
        const char = expr[i]
        const nextChar = expr[i + 1]

        if (char === '(') depth++
        if (char === ')') depth--

        // Check for && outside of parentheses
        if (char === '&' && nextChar === '&' && depth === 0) {
          andParts.push(currentPart.trim())
          currentPart = ''
          i++ // skip the second &
          continue
        }

        currentPart += char
      }
      if (currentPart.trim()) {
        andParts.push(currentPart.trim())
      }

      return andParts.every((part) => {
        // Check if this part has parentheses
        const parenMatch = part.match(/^\((.*)\)$/)
        if (parenMatch) {
          // Evaluate the OR expression inside parentheses
          // TODO: This only handles simple OR expressions, not nested AND/OR combinations
          // For full support, recursively call evaluateExpression(parenMatch[1])
          const innerExpr = parenMatch[1]
          return innerExpr
            .split(OR_OPERATOR)
            .some((term) => normalizedCorpus.includes(term.trim()))
        }

        // Regular term - check if corpus contains it
        return normalizedCorpus.includes(part)
      })
    }

    return evaluateExpression(normalizedKeyword)
  }

  const filtered = useMemo(() => {
    if (!keyword) return items
    return items.filter((item) => matchCorpus(item.corpus, keyword))
  }, [items, keyword])

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const newKeyword = selectedOption?.value ?? ''
    setKeyword(newKeyword)
    setMemoryIndex?.(0)
    router.push(`${pathname}?keyword=${encodeURIComponent(newKeyword)}`)
  }

  const handleClear = () => {
    setKeyword('')
    setSelectedOption(null)
    setInputValue('')
    setMemoryIndex?.(0)
    router.replace(pathname)
  }

  const handleExpand = () => {
    // Get current photo ID from displayed items (respects map filter)
    const currentIndex = refImageGallery?.current?.getCurrentIndex?.() ?? 0
    const itemsToUse = displayedItems || filtered
    const currentItem = itemsToUse[currentIndex]
    if (!currentItem) return

    const photoId = (currentItem as any).id || (currentItem as any).name // album.name
    if (!photoId) return

    // Replace URL with select parameter - this removes keyword and triggers select logic
    router.replace(`${pathname}?select=${photoId}`)
  }

  const { BookmarkButton } = useBookmark({
    refImageGallery,
    displayedItems: displayedItems || filtered,
    pathname,
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
        {keyword && (
          <>
            <Button
              type="button"
              onClick={handleClear}
              color="primary"
              variant="soft"
              title="Clear search"
            >
              Clear
            </Button>
            <Button
              type="button"
              onClick={handleExpand}
              color="primary"
              variant="soft"
              title="Clear search and view adjacent photos"
            >
              Expand
            </Button>
          </>
        )}
        <BookmarkButton />
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

  useEffect(() => {
    setFilteredItems(filtered)
    // Automatically update visible count when filtered results change
    setVisibleCount(filtered.length)
  }, [filtered])

  return {
    filtered,
    keyword,
    setKeyword,
    searchBox,
    setVisibleCount: setVisibleCountStable,
    setFiltered: setFilteredItems,
    setDisplayedItems,
  }
}
