import { Suspense } from 'react'

import AlbumPageComponent from '../../../src/components/AlbumPage'
import getAlbum from '../../../src/lib/album'
import getAlbums from '../../../src/lib/albums'
import getGalleries from '../../../src/lib/galleries'
import indexKeywords, { addGeographyToSearch } from '../../../src/lib/search'
import type { Album } from '../../../src/types/pages'

async function buildStaticPaths() {
  const { galleries } = await getGalleries()
  const groups = await Promise.all(galleries.map(async (gallery) => {
    const { albums } = await getAlbums(gallery)
    return albums.map(({ name: album }) => ({ params: { gallery, album } }))
  }))
  return groups.flat()
}

async function getAlbumData({ album, gallery }: Album.Params): Promise<Album.ComponentProps> {
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

async function AlbumPage({ params: { album, gallery } }: { params: Album.Params }) {
  const { items, meta, indexedKeywords } = await getAlbumData({ album, gallery })
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AlbumPageComponent items={items} meta={meta} indexedKeywords={indexedKeywords} />
    </Suspense>
  )
}

export default AlbumPage
