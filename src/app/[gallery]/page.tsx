import type { Metadata } from 'next'
import { type ParsedUrlQuery } from 'node:querystring'

import getAlbumNames from '../../lib/albums'
import getGalleries from '../../lib/galleries'
import indexKeywords from '../../lib/search'

import Galleries from '../../components/Albums'
import Link from '../../components/Link'
import type { AlbumMeta, IndexedKeywords, ServerSideAlbumItem } from '../../types/common'
import SearchBox from '../../components/SearchBox'

type ComponentProps = {
  gallery: NonNullable<AlbumMeta['gallery']>;
  albums: ServerSideAlbumItem[];
  indexedKeywords: IndexedKeywords[];
}

interface Params extends ParsedUrlQuery {
  gallery: NonNullable<AlbumMeta['gallery']>
}

export const metadata: Metadata = {
  title: 'History App - List Albums',
}

async function getAlbums({ gallery }: Params) {
  const { albums } = await getAlbumNames(gallery)
  const preparedAlbums = albums.map((album): ServerSideAlbumItem => ({
    ...album,
    corpus: [album.h1, album.h2, album.year, album.search].join(' '),
  }))
  return {
    gallery,
    albums: preparedAlbums,
    ...indexKeywords(preparedAlbums),
  }
}

export const generateStaticParams = async () => {
  const { galleries } = await getGalleries()
  return galleries.map((gallery) => ({ params: { gallery } }))
}

async function AlbumsPage({ params }: { params: { gallery: string } }) {
  const { gallery } = params
  const { albums, indexedKeywords } = await getAlbums({ gallery })

  return (
    <>
      <SearchBox albums={albums} indexedKeywords={indexedKeywords} />
      <h1>Links</h1>
      <ul><li><Link href={`/${gallery}/all`}>All</Link></li></ul>
      <ul><li><Link href={`/${gallery}/today`}>Today</Link></li></ul>
      <Galleries items={albums} gallery={gallery} />
    </>
  )
}

export default AlbumsPage
