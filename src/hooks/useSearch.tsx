'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

import AutoComplete from '../components/ComboBox'
import { IndexedKeywords } from '../types/common'
import styles from './search.module.css'

interface ServerSideItem {
  corpus: string;
}

export default function useSearch<ItemType extends ServerSideItem>(
  { items, setMemoryIndex, indexedKeywords }:
  { items: ItemType[]; setMemoryIndex?: Function; indexedKeywords: IndexedKeywords[] },
): { filtered: ItemType[]; keyword: string; setKeyword: Function; searchBox: JSX.Element; setFiltered: Function; } {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const [keyword, setKeyword] = useState(searchParams?.get('keyword') ?? '')
  const [selectedOption, setSelectedOption] = useState<IndexedKeywords | null>(null)
  const [filteredItems, setFilteredItems] = useState(items)

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const futureKeyword = selectedOption?.value ?? ''
    setKeyword(futureKeyword)
    setMemoryIndex?.(0)
    router.push(`${pathname}?keyword=${futureKeyword}`)
  }

  const keywordResultLabel = keyword === '' ? null : (<> for &quot;{keyword}&quot;</>)
  const getSearchBox = (filtered: ItemType[]) => (
    <form onSubmit={handleSubmit}>
      <div className={styles.row}>
        <h3 className={styles.searchCount}>Search results {filtered?.length} of {items?.length}{keywordResultLabel}</h3>
        <AutoComplete
          className={styles.autocomplete}
          options={indexedKeywords}
          onChange={setSelectedOption}
          value={selectedOption}
        />
        <input type="submit" value="Filter" title="`&&` is AND; `||` is OR; for example `breakfast||lunch`" />
      </div>
    </form>
  )

  const defaultReturn = {
    filtered: items,
    keyword: '',
    setKeyword,
    searchBox: getSearchBox(items),
    setFilteredItems,
  }

  useEffect(() => {
    const value = searchParams?.get('keyword')
    if (value) {
      setKeyword(value)
      setSelectedOption({ label: value, value })
    }
  }, [searchParams])

  if (!searchParams?.get('keyword')) {
    return {
      ...defaultReturn,
      setFiltered: () => {}, // Add missing setFiltered property
    }
  }

  const AND_OPERATOR = '&&'
  const OR_OPERATOR = '||'
  const normalizeCorpus = (corpus: string) => {
    const corpusWithoutAccentLow = corpus.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    return (k: string) => {
      const keywordWithoutAccentLow = k.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
      return corpusWithoutAccentLow.indexOf(keywordWithoutAccentLow) !== -1
    }
  }
  const filtered = items.filter((item) => {
    if (!keyword) return true
    const findMatch = normalizeCorpus(item.corpus)
    if (keyword.includes(AND_OPERATOR)) {
      return keyword.split(AND_OPERATOR).every(findMatch)
    }
    return keyword.split(OR_OPERATOR).some(findMatch)
  })

  return {
    filtered,
    setFiltered: setFilteredItems,
    keyword,
    setKeyword,
    searchBox: getSearchBox(filtered),
  }
}
