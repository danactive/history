import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

import Select from 'react-select/creatable'

const useSearch = ({ items, setMemoryIndex, indexedKeywords }) => {
  const router = useRouter()
  const [keyword, setKeyword] = useState(router.query.keyword || '')
  const [selectedOption, setSelectedOption] = useState(null)

  const getShareUrlStem = () => {
    if (router.asPath.includes('keyword=')) {
      return router.asPath
      // const urlParts = new URL(window.location)
      // urlParts.searchParams.set('keyword', keyword)
      // return urlParts.toString()
    }
    return `${router.asPath}?keyword=${keyword}`
  }

  function handleSubmit(event) {
    event.preventDefault()
    setKeyword(selectedOption.value)
    setMemoryIndex?.(0)
  }

  const keywordResultLabel = keyword === '' ? null : (<> for &quot;{keyword}&quot;</>)
  const getSearchBox = (filtered) => (
    <form onSubmit={handleSubmit}>
      <h3>Search results {filtered?.length} of {items?.length}{keywordResultLabel}</h3>
      <nav>{getShareUrlStem()}</nav>
      <Select
        isClearable
        options={indexedKeywords}
        defaultValue={selectedOption}
        onChange={setSelectedOption}
      />
      <input type="submit" value="Filter" />
      <code>`&&` is AND; `||` is OR; for example `breakfast||lunch`</code>
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
      setKeyword(router.query.keyword)
    }
  }, [router.isReady])

  if (!router.isReady) {
    return defaultReturn
  }

  const AND_OPERATOR = '&&'
  const OR_OPERATOR = '||'
  const normalizeCorpus = (corpus) => {
    const corpusWithoutAccentLow = corpus.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    return (k) => {
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
