import type { GetStaticPaths, GetStaticProps } from 'next'
import { type ParsedUrlQuery } from 'node:querystring'

import config from '../../../config.json'
import getAlbum from '../../src/lib/album'
import getAlbums from '../../src/lib/albums'
import getGalleries from '../../src/lib/galleries'
import indexKeywords from '../../src/lib/search'

import AlbumPageComponent from '../../src/components/AlbumPage'
import type { AlbumMeta, Item } from '../../src/types/common'

interface ServerSideTodayItem extends Item {
  album?: NonNullable<AlbumMeta['albumName']>;
  corpus: string;
  coordinateAccuracy: NonNullable<AlbumMeta['geo']>['zoom'];
}

type Props = {
  items: ServerSideTodayItem[];
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
    album: albumName,
    corpus: [item.description, item.caption, item.location, item.city, item.search].join(' '),
    coordinateAccuracy: item.coordinateAccuracy ?? albumCoordinateAccuracy,
  }))

  // reverse order for albums in ascending order (oldest on top)
  const allItems = (await albums.reduce(async (previousPromise, album) => {
    const prevItems = await previousPromise
    const { album: { items, meta } } = await getAlbum(params.gallery, album.name)
    const MMDD = new Date().toLocaleString('en-CA').substring(5, 10)
    const itemsMatchDate = items.filter((item) => item?.filename?.toString().substring?.(5, 10) === MMDD)
    const albumCoordinateAccuracy = meta?.geo?.zoom ?? config.defaultZoom
    const preparedItems = prepareItems({
      albumName: album.name,
      albumCoordinateAccuracy,
      items: itemsMatchDate,
    })
    return prevItems.concat(preparedItems)
  }, Promise.resolve([] as ServerSideTodayItem[]))).reverse()

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

function Today({ items, indexedKeywords }: Props) {
  return <AlbumPageComponent items={items} indexedKeywords={indexedKeywords} />
}

export default Today
