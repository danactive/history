import Head from 'next/head'
import { useMemo, useRef, useState } from 'react'
import type ReactImageGallery from 'react-image-gallery'
import styled from 'styled-components'

import config from '../../../config.json'
import getAlbum from '../../src/lib/album'
import { get as getAlbums } from '../../src/lib/albums'
import { get as getGalleries } from '../../src/lib/galleries'
import { indexKeywords } from '../../src/lib/search'

import AlbumContext from '../../src/components/Context'
import Img from '../../src/components/Img'
import Link from '../../src/components/Link'
import SplitViewer from '../../src/components/SplitViewer'
import useMemory from '../../src/hooks/useMemory'
import useSearch from '../../src/hooks/useSearch'

import { Item } from '../../src/types/common'

interface ServerSideAllItem extends Item {
  album?: string;
  gallery?: string;
  corpus: string;
  coordinateAccuracy: number;
}

const AlbumName = styled.b`
  margin-right: 1rem;
`
const SlideTo = styled.button`
  margin-left: 1rem;
`

export async function getStaticProps({ params: { gallery } }) {
  const { albums } = await getAlbums(gallery)

  const preparedItems = ({ albumName, albumCoordinateAccuracy, items }) => items.map((item) => ({
    ...item,
    gallery,
    album: albumName,
    corpus: [item.description, item.caption, item.location, item.city, item.search].join(' '),
    coordinateAccuracy: item.coordinateAccuracy ?? albumCoordinateAccuracy,
  }))
  // reverse order for albums in ascending order (oldest on top)
  const allItems = await [...albums].reverse().reduce(async (previousPromise, album) => {
    const prev = await previousPromise
    const { album: { items, meta } } = await getAlbum(gallery, album.name)
    const albumCoordinateAccuracy = meta?.geo?.zoom ?? config.defaultZoom
    return prev.concat(preparedItems({ albumName: album.name, albumCoordinateAccuracy, items }))
  }, Promise.resolve([]))

  return {
    props: { items: allItems, ...indexKeywords(allItems) },
  }
}

export async function getStaticPaths() {
  const { galleries } = await getGalleries()
  // Define these galleries as allowed, otherwise 404
  const paths = galleries.map((gallery) => ({ params: { gallery } }))
  return {
    paths,
    fallback: false,
  }
}

function AllPage(
  { items = [], indexedKeywords }:
  { items: ServerSideAllItem[]; indexedKeywords: object[] },
) {
  const refImageGallery = useRef<ReactImageGallery>(null)
  const [memoryIndex, setMemoryIndex] = useState(0)
  const {
    filtered,
    keyword,
    searchBox,
  } = useSearch({ items, setMemoryIndex, indexedKeywords })
  const { setViewed, memoryHtml } = useMemory(filtered, refImageGallery)
  const showThumbnail = (kw = '') => kw.length > 2
  const { width, height } = config.resizeDimensions.thumb

  function selectThumb(index) {
    refImageGallery.current.slideToIndex(index)
  }
  const zooms = useMemo(() => ({ geo: { zoom: config.defaultZoom } }), [config.defaultZoom])

  return (
    <div>
      <Head>
        <title>History App - All</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <AlbumContext.Provider value={zooms}>
        {searchBox}
        {memoryHtml}
        <SplitViewer
          setViewed={setViewed}
          items={filtered}
          refImageGallery={refImageGallery}
          memoryIndex={memoryIndex}
          setMemoryIndex={setMemoryIndex}
        />
        <ul>
          {filtered.map((item, index) => (
            <li key={item.filename.toString()}>
              <AlbumName>{item.album}</AlbumName>
              <Link href={`/${item.gallery}/${item.album}#select${item.id}`} title={item.corpus}>
                {!showThumbnail(keyword) && item.caption}
                {showThumbnail(keyword) && <Img src={item.thumbPath} alt={item.caption} title={item.corpus} width={width} height={height} />}
              </Link>
              <SlideTo type="button" onClick={() => selectThumb(index)}><a>Slide to</a></SlideTo>
            </li>
          ))}
        </ul>
      </AlbumContext.Provider>
    </div>
  )
}

export default AllPage
