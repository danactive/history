import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

// function debounce(func, timeout = 300){
//   let timer
//   return (...args) => {
//     clearTimeout(timer)
//     timer = setTimeout(() => { func.apply(this, args) }, timeout)
//   }
// }

const useSearch = (items) => {
  const router = useRouter()
  const [keyword, setKeyword] = useState(router.query.keyword || '')

  const getShareUrlStem = () => {
    if (router.asPath.includes('keyword=')) {
      return router.asPath
      // const urlParts = new URL(window.location)
      // urlParts.searchParams.set('keyword', keyword)
      // return urlParts.toString()
    }
    return `${router.asPath}?keyword=${keyword}`
  }

  const keywordResultLabel = keyword === '' ? null : (<> for &quot;{keyword}&quot;</>)
  const getSearchBox = (filtered) => (
    <>
      <h3>Search results {filtered?.length} of {items?.length}{keywordResultLabel}</h3>
      <nav>{getShareUrlStem()}</nav>
      <input type="text" onChange={(event) => setKeyword(event.target.value)} value={keyword} />
    </>
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
    return defaultReturn
  }, [router.isReady])

  if (!router.isReady) {
    return defaultReturn
  }

  const filtered = items.filter((item) => {
    if (!keyword) return true
    const corpusWithoutAccentLow = item.corpus.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    const keywordWithoutAccentLow = keyword.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    return corpusWithoutAccentLow.indexOf(keywordWithoutAccentLow) !== -1
  })

  return {
    filtered,
    keyword,
    setKeyword,
    searchBox: getSearchBox(filtered),
  }
}

export default useSearch
