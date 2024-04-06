import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import styled from 'styled-components'
import ComboBox, { type TYPES } from '../components/ComboBox'
import { FilmOptionType, IndexedKeywords } from '../types/common'

interface ServerSideItem {
  corpus: string;
}

const Row = styled.div`
  display: flex;
  align-items: center;
`
const AutoComplete = styled(ComboBox)`
  width: 20rem;
`
const SearchCount = styled.h3`
  margin-right: 1rem;
`
const ShareLink = styled.nav`
  margin-left: 1rem;
`

function useSearch<ItemType extends ServerSideItem>(
  { items, setMemoryIndex, indexedKeywords }:
  { items: ItemType[]; setMemoryIndex?: Function; indexedKeywords: IndexedKeywords[] },
): { filtered: ItemType[]; keyword: string; setKeyword: Function; searchBox: JSX.Element; } {
  const router = useRouter()
  const [keyword, setKeyword] = useState(router.query.keyword?.toString() || '')
  const [selectedOption, setSelectedOption] = useState<FilmOptionType | null>(null)

  const getShareUrlStem = () => {
    if (router.asPath.includes('keyword=')) {
      return decodeURI(router.asPath)
      // const urlParts = new URL(window.location)
      // urlParts.searchParams.set('keyword', keyword)
      // return urlParts.toString()
    }
    return `${router.asPath}?keyword=${keyword}`
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setKeyword(selectedOption?.value ?? '')
    setMemoryIndex?.(0)
  }

  const keywordResultLabel = keyword === '' ? null : (<> for &quot;{keyword}&quot;</>)
  const getSearchBox = (filtered: ItemType[]) => (
    <form onSubmit={handleSubmit}>
      <Row>
        <SearchCount>Search results {filtered?.length} of {items?.length}{keywordResultLabel}</SearchCount>
        <AutoComplete
          options={indexedKeywords}
          onChange={setSelectedOption}
          value={selectedOption}
        />
        <input type="submit" value="Filter" title="`&&` is AND; `||` is OR; for example `breakfast||lunch`" />
        <ShareLink>{getShareUrlStem()}</ShareLink>
      </Row>
    </form>
  )

  const defaultReturn = {
    filtered: items,
    keyword: '',
    setKeyword,
    searchBox: getSearchBox(items),
  }

  useEffect(() => {
    if (router.isReady && router.query.keyword) {
      setKeyword(router.query.keyword?.toString())
      const newValue: FilmOptionType = {
        label: Array.isArray(router.query.keyword) ? router.query.keyword[0] : router.query.keyword,
        inputValue: Array.isArray(router.query.keyword) ? router.query.keyword[0] : router.query.keyword,
      }
      setSelectedOption(newValue)
    }
  }, [router.isReady])

  if (!router.isReady) {
    return defaultReturn
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
    keyword,
    setKeyword,
    searchBox: getSearchBox(filtered),
  }
}

export default useSearch
