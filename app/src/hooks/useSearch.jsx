/* global window */
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

  useEffect(() => {
    if (router.isReady && router.query.keyword) {
      setKeyword(router.query.keyword)
    }
    return {
      filtered: items,
      keyword: '',
      setKeyword,
      shareUrlStem: getShareUrlStem(),
    }
  }, [router.isReady])

  if (!router.isReady) {
    return {
      filtered: items,
      keyword: '',
      setKeyword,
      shareUrlStem: getShareUrlStem(),
    }
  }

  const filtered = items.filter((item) => {
    if (!keyword) return true
    const contentWithoutAccentLow = item.content.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    const keywordWithoutAccentLow = keyword.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    return contentWithoutAccentLow.indexOf(keywordWithoutAccentLow) !== -1
  })

  return {
    filtered,
    keyword,
    setKeyword,
    shareUrlStem: getShareUrlStem(),
  }
}

export default useSearch
