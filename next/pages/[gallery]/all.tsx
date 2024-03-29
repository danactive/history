import type { GetStaticPaths, GetStaticProps } from 'next'
import Head from 'next/head'
import { type ParsedUrlQuery } from 'node:querystring'
import { useMemo, useRef, useState } from 'react'
import type ReactImageGallery from 'react-image-gallery'
import styled from 'styled-components'

import config from '../../../config.json'
import getAlbum from '../../src/lib/album'
import getAlbums from '../../src/lib/albums'
import getGalleries from '../../src/lib/galleries'
import indexKeywords from '../../src/lib/search'

import AlbumContext from '../../src/components/Context'
import Img from '../../src/components/Img'
import Link from '../../src/components/Link'
import SplitViewer from '../../src/components/SplitViewer'
import useMemory from '../../src/hooks/useMemory'
import useSearch from '../../src/hooks/useSearch'

import { AlbumMeta, Item } from '../../src/types/common'

const AlbumName = styled.b`
  margin-right: 1rem;
`
const SlideTo = styled.button`
  margin-left: 1rem;
`

interface ServerSideAllItem extends Item {
  album?: NonNullable<AlbumMeta['albumName']>;
  gallery?: NonNullable<AlbumMeta['gallery']>;
  corpus: string;
  coordinateAccuracy: NonNullable<AlbumMeta['geo']>['zoom'];
}

type Props = {
  items: ServerSideAllItem[];
  indexedKeywords: object[];
}

interface Params extends ParsedUrlQuery {
  gallery: NonNullable<AlbumMeta['gallery']>
}

export const getStaticProps: GetStaticProps<Props, Params> = async (context) => {
  const params = context.params!
  const { albums } = await getAlbums(params.gallery)

  const prepareItems = (
    { albumName, albumCoordinateAccuracy, items }:
    {
      albumName: AlbumMeta['albumName'],
      albumCoordinateAccuracy: NonNullable<AlbumMeta['geo']>['zoom'],
      items: Item[],
    },
  ) => items.map((item) => ({
    ...item,
    gallery: params.gallery,
    album: albumName,
    corpus: [item.description, item.caption, item.location, item.city, item.search].join(' '),
    coordinateAccuracy: item.coordinateAccuracy ?? albumCoordinateAccuracy,
  }))

  // reverse order for albums in ascending order (oldest on top)
  const allItems = (await albums.reduce(async (previousPromise, album) => {
    const prev = await previousPromise
    const { album: { items, meta } } = await getAlbum(params.gallery, album.name)
    const albumCoordinateAccuracy = meta?.geo?.zoom ?? config.defaultZoom
    const preparedItems = prepareItems({
      albumName: album.name,
      albumCoordinateAccuracy,
      items,
    })
    return prev.concat(preparedItems)
  }, Promise.resolve([] as ServerSideAllItem[]))).reverse()

  return {
    props: { items: allItems, ...indexKeywords(allItems) },
  }
}

export const getStaticPaths: GetStaticPaths = async () => {
  const { galleries } = await getGalleries()
  // Define these galleries as allowed, otherwise 404
  const paths = galleries.map((gallery) => ({ params: { gallery } }))
  return {
    paths,
    fallback: false,
  }
}

function AllPage({ items = [], indexedKeywords }: Props) {
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

  function selectThumb(index: number) {
    refImageGallery.current?.slideToIndex(index)
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
