import Head from 'next/head'
import styled from 'styled-components'
import { useRef } from 'react'

import { get as getAlbum } from '../../src/lib/album'
import { get as getAlbums } from '../../src/lib/albums'
import { get as getGalleries } from '../../src/lib/galleries'

import SplitViewer from '../../src/components/SplitViewer'
import ThumbImg from '../../src/components/ThumbImg'
import useSearch from '../../src/hooks/useSearch'

async function buildStaticPaths() {
  const { galleries } = await getGalleries()
  const groups = await Promise.all(galleries.map(async (gallery) => {
    const { albums } = await getAlbums(gallery)
    return albums.map(({ name: album }) => ({ params: { gallery, album } }))
  }))
  return groups.flat()
}

export async function getStaticProps({ params: { gallery, album } }) {
  const { album: albumDoc } = await getAlbum(gallery, album)
  const preparedItems = albumDoc.items.map((item) => ({
    ...item,
    corpus: [item.description, item.caption, item.location, item.city, item.search].join(' '),
  }))
  return {
    props: { items: preparedItems },
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

function AlbumPage({ items = [] }) {
  const refImageGallery = useRef(null)
  const {
    filtered,
    searchBox,
  } = useSearch(items)

  function selectThumb(index) {
    refImageGallery.current.slideToIndex(index)
  }

  return (
    <div>
      <Head>
        <title>History App - Album</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {searchBox}
      <SplitViewer items={filtered} refImageGallery={refImageGallery} />
      <Wrapper>
        {filtered.map((item, index) => (
          <ThumbImg
            onClick={() => selectThumb(index)}
            src={item.thumbPath}
            caption={item.caption}
            key={item.filename}
            id={`select${item.id}`}
          />
        ))}
      </Wrapper>
    </div>
  )
}

export default AlbumPage
