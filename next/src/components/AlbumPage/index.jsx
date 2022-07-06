import Head from 'next/head'
import styled from 'styled-components'
import { useState, useRef } from 'react'

import AlbumContext from '../Context'
import SplitViewer from '../SplitViewer'
import ThumbImg from '../ThumbImg'
import useSearch from '../../hooks/useSearch'
import useMemory from '../../hooks/useMemory'

const Wrapper = styled.ul`
  list-style: none;
  padding-left: 2px;
`

function AlbumPage({ items = [], meta }) {
  const refImageGallery = useRef(null)
  const [memoryIndex, setMemoryIndex] = useState(0)
  const {
    filtered,
    searchBox,
  } = useSearch(items, setMemoryIndex)
  const { setViewed, memoryHtml, viewedList } = useMemory(filtered, refImageGallery)

  function selectThumb(index) {
    refImageGallery.current.slideToIndex(index)
  }

  return (
    <div>
      <Head>
        <title>History App - Album</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <AlbumContext.Provider value={meta}>
        {searchBox}
        <SplitViewer
          setViewed={setViewed}
          items={filtered}
          refImageGallery={refImageGallery}
          memoryIndex={memoryIndex}
          setMemoryIndex={setMemoryIndex}
        />
        {memoryHtml}
        <Wrapper>
          {filtered.map((item, index) => (
            <ThumbImg
              onClick={() => selectThumb(index)}
              src={item.thumbPath}
              caption={item.caption}
              key={item.filename}
              id={`select${item.id}`}
              viewed={viewedList.has(item.id ?? item.filename)}
            />
          ))}
        </Wrapper>
      </AlbumContext.Provider>
    </div>
  )
}

export default AlbumPage
