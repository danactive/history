import { Suspense } from 'react'

import type { Metadata } from 'next'
import AlbumPageComponent from '../../../src/components/AlbumPage'
import getAlbum from '../../../src/lib/album'
import getAlbums from '../../../src/lib/albums'
import getGalleries from '../../../src/lib/galleries'
import indexKeywords, { addGeographyToSearch } from '../../../src/lib/search'
import config from '../../../src/models/config'
import type { AlbumMeta, Gallery, Item } from '../../../src/types/common'

interface ServerSideTodayItem extends Item {
  album?: NonNullable<AlbumMeta['albumName']>;
  corpus: string;
  coordinateAccuracy: NonNullable<AlbumMeta['geo']>['zoom'];
}

export const metadata: Metadata = {
  title: 'Today - History App',
}

export async function generateStaticParams() {
  const { galleries } = await getGalleries()
  return galleries.map((gallery) => ({ gallery }))
}

async function getTodayItems(gallery: Gallery) {
  const { [gallery]: { albums } } = await getAlbums(gallery)

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
    search: addGeographyToSearch(item),
  }))

  const MMDD = new Date().toLocaleString('en-CA').substring(5, 10)

  const allItems = (await albums.reduce(async (previousPromise, album) => {
    const prevItems = await previousPromise
    const { album: { items, meta } } = await getAlbum(gallery, album.name)
    const itemsMatchDate = items.filter((item) => item?.filename?.toString().substring?.(5, 10) === MMDD)
    const albumCoordinateAccuracy = meta?.geo?.zoom ?? config.defaultZoom
    const preparedItems = prepareItems({
      albumName: album.name,
      albumCoordinateAccuracy,
      items: itemsMatchDate,
    })
    return prevItems.concat(preparedItems.reverse())
  }, Promise.resolve([] as ServerSideTodayItem[]))).reverse()

  const { indexedKeywords } = indexKeywords(allItems)

  return { items: allItems, indexedKeywords }
}

export default async function TodayServer(props: { params: Promise<{ gallery: Gallery }> }) {
  const params = await props.params
  const { items, indexedKeywords } = await getTodayItems(params.gallery)
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AlbumPageComponent items={items} indexedKeywords={indexedKeywords} />
    </Suspense>
  )
}
