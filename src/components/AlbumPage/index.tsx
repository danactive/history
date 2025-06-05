'use client'

import type { Metadata } from 'next'
import { useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import type ReactImageGallery from 'react-image-gallery'

import useMemory from '../../hooks/useMemory'
import useSearch from '../../hooks/useSearch'
import type { Album } from '../../types/pages'
import AlbumContext from '../Context'
import SplitViewer from '../SplitViewer'
import ThumbImg from '../ThumbImg'
import styles from './styles.module.css'

export const metadata: Metadata = {
  title: 'Album - History App',
}

function AlbumPage({ items = [], meta, indexedKeywords }: Album.ComponentProps) {
  const refImageGallery = useRef<ReactImageGallery>(null)
  const [memoryIndex, setMemoryIndex] = useState(0)
  const {
    filtered,
    searchBox,
  } = useSearch({ items, setMemoryIndex, indexedKeywords })
  const { setViewed, memoryHtml, viewedList } = useMemory(filtered, refImageGallery)
  const searchParams = useSearchParams()
  const selectId = searchParams.get('select')

  useEffect(() => {
    if (selectId) {
      selectThumb(filtered.findIndex(f => f.id === selectId))
    }
  }, [selectId])


  function selectThumb(index: number) {
    refImageGallery.current?.slideToIndex(index)
  }

  return (
    <div>
      <AlbumContext.Provider value={meta}>
        {searchBox}
        {memoryHtml}
        <SplitViewer
          setViewed={setViewed}
          items={filtered}
          refImageGallery={refImageGallery}
          memoryIndex={memoryIndex}
          setMemoryIndex={setMemoryIndex}
        />
        <ul className={styles.wrapper}>
          {filtered.map((item, index) => (
            <ThumbImg
              onClick={() => selectThumb(index)}
              src={item.thumbPath}
              caption={item.caption}
              key={item.filename.toString()}
              id={`select${item.id}`}
              viewed={viewedList.has(item.id)}
            />
          ))}
        </ul>
      </AlbumContext.Provider>
    </div>
  )
}

export default AlbumPage
