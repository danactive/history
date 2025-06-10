import { Suspense } from 'react'

import type { Metadata } from 'next'
import PersonsClient from '../../../src/components/Persons/PersonsClient'
import getAlbum from '../../../src/lib/album'
import getAlbums from '../../../src/lib/albums'
import getGalleries from '../../../src/lib/galleries'
import indexKeywords, { addGeographyToSearch } from '../../../src/lib/search'
import config from '../../../src/models/config'
import type { AlbumMeta, Gallery, Item, ServerSideAllItem } from '../../../src/types/common'
import type { All } from '../../../src/types/pages'

export const metadata: Metadata = {
  title: 'Persons - History App',
}

export async function generateStaticParams() {
  const { galleries } = await getGalleries()

  return galleries.map((gallery) => ({
    gallery,
  }))
}

async function getPersonsData({ gallery }: All.Params): Promise<All.ComponentProps> {
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
    gallery,
    album: albumName,
    corpus: [item.description, item.caption, item.location, item.city, item.search].join(' '),
    coordinateAccuracy: item.coordinateAccuracy ?? albumCoordinateAccuracy,
    search: addGeographyToSearch(item),
  }))

  // reverse order for albums in ascending order (oldest on top)
  const allItems = (await albums.reduce(async (previousPromise, album) => {
    const prev = await previousPromise
    const { album: { items, meta } } = await getAlbum(gallery, album.name)
    const albumCoordinateAccuracy = meta?.geo?.zoom ?? config.defaultZoom
    const preparedItems = prepareItems({
      albumName: album.name,
      albumCoordinateAccuracy,
      items,
    })
    return prev.concat(preparedItems)
  }, Promise.resolve([] as ServerSideAllItem[]))).reverse()

  return {
    items: allItems, ...indexKeywords(allItems),
  }
}

export default async function PersonsServer(props: { params: Promise<{ gallery: Gallery }> }) {
  const params = await props.params

  const {
    gallery,
  } = params

  const { items, indexedKeywords } = await getPersonsData({ gallery })
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PersonsClient items={items} indexedKeywords={indexedKeywords} />
    </Suspense>
  )
}
