import Head from 'next/head'
import styled from 'styled-components'
import { useRef } from 'react'

import { get as getAlbum } from '../../src/lib/album'
import { get as getAlbums } from '../../src/lib/albums'
import { get as getGalleries } from '../../src/lib/galleries'

import AlbumContext from '../../src/components/Context'
import SplitViewer from '../../src/components/SplitViewer'
import ThumbImg from '../../src/components/ThumbImg'
import useSearch from '../../src/hooks/useSearch'
import useMemory from '../../src/hooks/useMemory'

async function buildStaticPaths() {
  const { galleries } = await getGalleries()
  const groups = await Promise.all(galleries.map(async (gallery) => {
    const { albums } = await getAlbums(gallery)
    return albums.map(({ name: album }) => ({ params: { gallery, album } }))
  }))
  return groups.flat()
}

export async function getStaticProps({ params: { gallery, album } }) {
  const { album: { items, meta } } = await getAlbum(gallery, album)
  const preparedItems = items.map((item) => ({
    ...item,
    corpus: [item.description, item.caption, item.location, item.city, item.search].join(' '),
  }))
  return {
    props: { items: preparedItems, meta },
  }
}

export async function getStaticPaths() {
  // Define these albums as allowed, otherwise 404
  return {
    paths: await buildStaticPaths(),
    fallback: false,
  }
}

const Wrapper = styled.ul`
  list-style: none;
  padding-left: 2px;
`

function AlbumPage({ items = [], meta }) {
  const refImageGallery = useRef(null)
  const {
    filtered,
    searchBox,
  } = useSearch(items)
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
        <SplitViewer setViewed={setViewed} items={filtered} refImageGallery={refImageGallery} />
        {memoryHtml}
        <Wrapper>
          {filtered.map((item, index) => (
            <ThumbImg
              onClick={() => selectThumb(index)}
              src={item.thumbPath}
              caption={item.caption}
              key={item.filename}
              id={`select${item.id}`}
              viewed={(viewedList.includes(index))}
            />
          ))}
        </Wrapper>
      </AlbumContext.Provider>
    </div>
  )
}

export default AlbumPage
