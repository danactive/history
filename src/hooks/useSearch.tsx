'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import {
  type Dispatch, type SetStateAction, useEffect, useMemo, useState,
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

  const [keyword, setKeyword] = useState<string>(searchParams?.get('keyword') ?? '')
  const [selectedOption, setSelectedOption] = useState<IndexedKeywords | null>(null)
  const [filteredItems, setFilteredItems] = useState<ItemType[]>(items)

  const AND_OPERATOR = '&&'
  const OR_OPERATOR = '||'

  const normalize = (text: string) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()

  const matchCorpus = (corpus: string, kword: string): boolean => {
    const normalizedCorpus = normalize(corpus)
    const normalizedKeyword = normalize(kword)

    if (normalizedKeyword.includes(AND_OPERATOR)) {
      return normalizedKeyword
        .split(AND_OPERATOR)
        .every((term) => normalizedCorpus.includes(term.trim()))
    }

    return normalizedKeyword
      .split(OR_OPERATOR)
      .some((term) => normalizedCorpus.includes(term.trim()))
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

  const keywordResultLabel = keyword
    ? <> for &quot;{keyword}&quot;</>
    : null

  const searchBox = (
    <form onSubmit={handleSubmit}>
      <div className={styles.row}>
        <h3 className={styles.searchCount}>
          Search results {filtered.length} of {items.length}
          {keywordResultLabel}
        </h3>
        <AutoComplete
          className={styles.autocomplete}
          options={indexedKeywords}
          onChange={setSelectedOption}
          value={selectedOption}
        />
        <input
          type="submit"
          value="Filter"
          title="`&&` is AND; `||` is OR; for example `breakfast||lunch`"
        />
      </div>
    </form>
  )

  useEffect(() => {
    const value = searchParams?.get('keyword') ?? ''
    if (value && value !== keyword) {
      setKeyword(value)
      setSelectedOption({ label: value, value })
    }
  }, [searchParams, keyword])

  useEffect(() => {
    setFilteredItems(filtered)
  }, [filtered])

  return {
    filtered,
    keyword,
    setKeyword,
    searchBox,
    setFiltered: setFilteredItems,
  }
}
