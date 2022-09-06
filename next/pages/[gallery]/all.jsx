import Head from 'next/head'
import { useMemo, useState, useRef } from 'react'

import config from '../../../config.json'
import { get as getAlbum } from '../../src/lib/album'
import { get as getAlbums } from '../../src/lib/albums'
import { get as getGalleries } from '../../src/lib/galleries'
import { indexKeywords } from '../../src/lib/search'

import AlbumContext from '../../src/components/Context'
import Img from '../../src/components/Img'
import Link from '../../src/components/Link'
import useMemory from '../../src/hooks/useMemory'
import useSearch from '../../src/hooks/useSearch'
import SplitViewer from '../../src/components/SplitViewer'

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

function AllPage({ items = [], indexedKeywords }) {
  const refImageGallery = useRef(null)
  const [memoryIndex, setMemoryIndex] = useState(0)
  const {
    filtered,
    keyword,
    searchBox,
  } = useSearch({ items, setMemoryIndex, indexedKeywords })
  const { setViewed, memoryHtml, viewedList } = useMemory(filtered, refImageGallery)
  const showThumbnail = (kw = '') => kw.length > 2

  function selectThumb(index) {
    refImageGallery.current.slideToIndex(index)
  }
  const zooms = useMemo(() => ({ geo: { zoom: config.defaultZoom } }))

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
            <li key={item.filename}>
              <b>{item.album}</b>
              {item.corpus}
              {showThumbnail(keyword) ? <Img src={item.thumbPath} alt={item.caption} /> : item.caption}
              <Link href={`/${item.gallery}/${item.album}#select${item.id}`}>{item.caption}</Link>
              <button type="button" onClick={() => selectThumb(index)}><a>Slide to</a></button>
              Viewed =
              {' '}
              {viewedList.has(item.id ?? item.filename).toString()}
            </li>
          ))}
        </ul>
      </AlbumContext.Provider>
    </div>
  )
}

export default AllPage
