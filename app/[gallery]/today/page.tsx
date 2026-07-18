import type { Metadata } from 'next'
import { Suspense } from 'react'
import AlbumPageComponent from '../../../src/components/Album/AlbumClient'
import getAlbum from '../../../src/lib/album'
import getAlbums from '../../../src/lib/albums'
import getGalleries from '../../../src/lib/galleries'
import { generateClusters } from '../../../src/lib/generate-clusters'
import type { TodaySearchParams } from '../../../src/lib/monthDay'
import { getMonthDayFromSearchParams } from '../../../src/lib/monthDay'
import indexKeywords, { addGeographyToSearch, addYearToSearch, getItemYearFromFilename } from '../../../src/lib/search'
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

async function getTodayItems(gallery: Gallery, monthDay: string) {
  const { [gallery]: { albums } } = await getAlbums(gallery)

  const prepareItems = (
    { albumName, albumCoordinateAccuracy, items }:
    {
      albumName: AlbumMeta['albumName'],
      albumCoordinateAccuracy: NonNullable<AlbumMeta['geo']>['zoom'],
      items: Item[],
    },
  ) => items.map((item) => {
    const year = getItemYearFromFilename(item)
    const search = addYearToSearch(addGeographyToSearch(item), item)
    return {
      ...item,
      album: albumName,
      corpus: [item.description, item.caption, item.location, item.city, search, year]
        .join(' ')
        .trim(),
      coordinateAccuracy: item.coordinateAccuracy ?? albumCoordinateAccuracy,
      search,
    }
  })

  const allItems = (await albums.reduce(async (previousPromise, album) => {
    const prevItems = await previousPromise
    const { album: { items, meta } } = await getAlbum(gallery, album.name)
    const itemsMatchDate = items.filter((item) => item?.filename?.toString().substring?.(5, 10) === monthDay)
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

export default async function TodayServer({
  params,
  searchParams,
}: {
  params: Promise<{ gallery: Gallery }>,
  searchParams?: Promise<TodaySearchParams>,
}) {
  const [{ gallery }, resolvedSearchParams] = await Promise.all([
    params,
    searchParams ?? Promise.resolve({}),
  ])
  const monthDay = getMonthDayFromSearchParams(resolvedSearchParams)
  const { items, indexedKeywords } = await getTodayItems(gallery, monthDay)
  const clusteredMarkers = generateClusters(items)
  return (
    <Suspense fallback={<div>Loading Today...</div>}>
      <AlbumPageComponent
        gallery={gallery}
        monthDay={monthDay}
        items={items}
        indexedKeywords={indexedKeywords}
        clusteredMarkers={clusteredMarkers}
      />
    </Suspense>
  )
}
