import Head from 'next/head'
import { useMemo, useState, useRef } from 'react'

import { get as getAlbum } from '../../src/lib/album'
import { get as getAlbums } from '../../src/lib/albums'
import { get as getGalleries } from '../../src/lib/galleries'

import AlbumContext from '../../src/components/Context'
import Link from '../../src/components/Link'
import useMemory from '../../src/hooks/useMemory'
import useSearch from '../../src/hooks/useSearch'
import SplitViewer from '../../src/components/SplitViewer'

export async function getStaticProps({ params: { gallery } }) {
  const { albums } = await getAlbums(gallery)

  const preparedItems = ({ albumName, items }) => items.map((item) => ({
    ...item,
    gallery,
    album: albumName,
    corpus: [item.description, item.caption, item.location, item.city, item.search].join(' '),
  }))
  // reverse order for albums in ascending order (oldest on top)
  const allItems = await [...albums].reverse().reduce(async (previousPromise, album) => {
    const prev = await previousPromise
    const { album: { items } } = await getAlbum(gallery, album.name)
    return prev.concat(preparedItems({ albumName: album.name, items }))
  }, Promise.resolve([]))

  return {
    props: { items: allItems },
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

function AllPage({ items = [] }) {
  const refImageGallery = useRef(null)
  const [memoryIndex, setMemoryIndex] = useState(0)
  const {
    filtered,
    keyword,
    searchBox,
  } = useSearch(items, setMemoryIndex)
  const { setViewed, memoryHtml, viewedList } = useMemory(filtered, refImageGallery)
  const showThumbnail = (kw = '') => kw.length > 2

  function selectThumb(index) {
    refImageGallery.current.slideToIndex(index)
  }
  const zooms = useMemo(() => ({ geo: { zoom: 10 } }))

  return (
    <div>
      <Head>
        <title>History App - All</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <AlbumContext.Provider value={zooms}>
        {searchBox}
        <SplitViewer
          setViewed={setViewed}
          items={filtered}
          refImageGallery={refImageGallery}
          memoryIndex={memoryIndex}
          setMemoryIndex={setMemoryIndex}
        />
        {memoryHtml}
        <ul>
          {filtered.map((item, index) => (
            <li key={item.filename}>
              <b>{item.album}</b>
              {item.corpus}
              {showThumbnail(keyword) ? <img src={item.thumbPath} alt={item.caption} /> : item.caption}
              <Link href={`/${item.gallery}/${item.album}#select${item.id}`}>{item.caption}</Link>
              <button type="button" onClick={() => selectThumb(index)}><a>Slide to</a></button>
              Viewed = {viewedList.has(item.id ?? item.filename).toString()}
            </li>
          ))}
        </ul>
      </AlbumContext.Provider>
    </div>
  )
}

export default AllPage
