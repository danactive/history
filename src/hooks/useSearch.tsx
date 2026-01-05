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
import styles from './search.module.css'

interface ServerSideItem {
  corpus: string;
}

interface UseSearchProps<ItemType> {
  items: ItemType[];
  setMemoryIndex?: Dispatch<SetStateAction<number>>;
  indexedKeywords?: IndexedKeywords[];
}

export default function useSearch<ItemType extends ServerSideItem>({
  items,
  setMemoryIndex,
  indexedKeywords = [],
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

  // Count of currently visible thumbnails (consumer updates this)
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

  const matchCorpus = (corpus: string, kword: string): boolean => {
    const normalizedCorpus = normalize(corpus)
    const normalizedKeyword = normalize(kword)

    // Handle parentheses by evaluating OR expressions first, then AND
    // NOTE: Currently supports single-level parentheses only.
    // Nested expressions like ((a || b) && c) or (a && (b || c)) are not fully supported.
    // The outer parentheses will be matched, but inner nested logic won't be recursively evaluated.
    const evaluateExpression = (expr: string): boolean => {
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
          <Button
            type="button"
            onClick={handleClear}
            color="primary"
            variant="soft"
            title="Clear search"
          >
            Clear
          </Button>
        )}
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
  }, [filtered])

  return {
    filtered,
    keyword,
    setKeyword,
    searchBox,
    setVisibleCount: setVisibleCountStable,
    setFiltered: setFilteredItems,
  }
}
