import type { Metadata } from 'next'
import { Suspense } from 'react'

import GalleryPageComponent from '../../src/components/GalleryPage'
import getAlbums from '../../src/lib/albums'
import getGalleries from '../../src/lib/galleries'
import indexKeywords from '../../src/lib/search'
import type { Gallery as GalleryName, ServerSideAlbumItem } from '../../src/types/common'
import type { Gallery } from '../../src/types/pages'

export const metadata: Metadata = {
  title: 'Albums - History App',
}

export async function generateStaticParams() {
  const { galleries } = await getGalleries()
  return galleries.map((gallery) => ({
    gallery,
  }))
}

async function getAlbumsData(gallery: GalleryName): Promise<Gallery.ComponentProps> {
  const { [gallery]: { albums } } = await getAlbums(gallery)
  const preparedAlbums = albums.map((album): ServerSideAlbumItem => ({
    ...album,
    corpus: [album.h1, album.h2, album.year, album.search].join(' '),
  }))

  return {
    gallery, albums: preparedAlbums, ...indexKeywords(preparedAlbums),
  }
}

export default async function GalleryServer(props: { params: Promise<Gallery.Params> }) {
  const params = await props.params

  const {
    gallery,
  } = params

  const { albums, indexedKeywords } = await getAlbumsData(gallery)

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <GalleryPageComponent albums={albums} gallery={gallery} indexedKeywords={indexedKeywords} />
    </Suspense>
  )
}
