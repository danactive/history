'use client'

import useSearch from '../hooks/useSearch'

export default function SearchBox({ albums, indexedKeywords }) {
  const { filtered, searchBox } = useSearch({ items: albums, indexedKeywords })

  return (
    <div>
      {searchBox}
    </div>
  )
}
