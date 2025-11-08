import type { Metadata, ResolvingMetadata } from 'next'
import { Suspense } from 'react'

import AlbumPageComponent from '../../../src/components/Album/AlbumClient'
import getAlbum from '../../../src/lib/album'
import getAlbums from '../../../src/lib/albums'
import getGalleries from '../../../src/lib/galleries'
import indexKeywords, { addGeographyToSearch } from '../../../src/lib/search'
import type { Album } from '../../../src/types/pages'

export async function generateMetadata(
  { params }: { params: Promise<Album.Params> },
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const album = (await params).album

  return {
    title: `Album ${album} - History App`,
  }
}

async function buildStaticPaths() {
  const { galleries } = await getGalleries()
  const groups = await Promise.all(galleries.map(async (gallery) => {
    const { [gallery]: { albums } } = await getAlbums(gallery)
    return albums.map(({ name: album }) => ({ params: { gallery, album } }))
  }))
  return groups.flat()
}

async function getAlbumItems({ album, gallery }: Album.Params): Promise<Album.ComponentProps> {
  const { album: { items, meta } } = await getAlbum(gallery, album)
  const preparedItems = items.map((item) => ({
    ...item,
    search: addGeographyToSearch(item),
    corpus: [item.description, item.caption, item.location, item.city, item.search].join(' '),
  }))

  return {
    items: preparedItems, meta, ...indexKeywords(preparedItems),
  }
}

export async function generateStaticParams() {
  return buildStaticPaths()
}

export default async function AlbumServer(props: { params: Promise<Album.Params> }) {
  const params = await props.params

  const {
    album,
    gallery,
  } = params

  const { items, meta, indexedKeywords } = await getAlbumItems({ album, gallery })
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AlbumPageComponent items={items} meta={meta} indexedKeywords={indexedKeywords} />
    </Suspense>
  )
}
