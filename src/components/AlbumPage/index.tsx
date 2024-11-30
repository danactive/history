import Head from 'next/head'
import { useRef, useState } from 'react'
import type ReactImageGallery from 'react-image-gallery'

import useMemory from '../../hooks/useMemory'
import useSearch from '../../hooks/useSearch'
import AlbumContext from '../Context'
import SplitViewer from '../SplitViewer'
import ThumbImg from '../ThumbImg'
import styles from './styles.module.css'

import type { Album } from '../../types/pages'

function AlbumPage({ items = [], meta, indexedKeywords }: Album.ComponentProps) {
  const refImageGallery = useRef<ReactImageGallery>(null)
  const [memoryIndex, setMemoryIndex] = useState(0)
  const {
    filtered,
    searchBox,
  } = useSearch({ items, setMemoryIndex, indexedKeywords })
  const { setViewed, memoryHtml, viewedList } = useMemory(filtered, refImageGallery)

  function selectThumb(index: number) {
    refImageGallery.current?.slideToIndex(index)
  }

  return (
    <div>
      <Head>
        <title>History App - Album</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
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
