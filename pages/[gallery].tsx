import type { GetStaticPaths, GetStaticProps } from 'next'
import Head from 'next/head'
import { type ParsedUrlQuery } from 'node:querystring'

import getAlbums from '../src/lib/albums'
import getGalleries from '../src/lib/galleries'
import indexKeywords from '../src/lib/search'

import Galleries from '../src/components/Albums'
import Link from '../src/components/Link'
import useSearch from '../src/hooks/useSearch'
import type { AlbumMeta, IndexedKeywords, ServerSideAlbumItem } from '../src/types/common'

type ComponentProps = {
  gallery: NonNullable<AlbumMeta['gallery']>;
  albums: ServerSideAlbumItem[];
  indexedKeywords: IndexedKeywords[];
}

interface Params extends ParsedUrlQuery {
  gallery: NonNullable<AlbumMeta['gallery']>
}

export const getStaticProps: GetStaticProps<ComponentProps, Params> = async (context) => {
  const params = context.params!
  const { albums } = await getAlbums(params.gallery)
  const preparedAlbums = albums.map((album): ServerSideAlbumItem => ({
    ...album,
    corpus: [album.h1, album.h2, album.year, album.search].join(' '),
  }))
  return {
    props: { gallery: params.gallery, albums: preparedAlbums, ...indexKeywords(preparedAlbums) },
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

function AlbumsPage({ gallery, albums, indexedKeywords }: ComponentProps) {
  const {
    filtered,
    searchBox,
  } = useSearch({ items: albums, indexedKeywords })

  return (
    <div>
      <Head>
        <title>History App - List Albums</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div>{searchBox}</div>
      <h1>Links</h1>
      <ul><li><Link href={`/${gallery}/all`}>All</Link></li></ul>
      <ul><li><Link href={`/${gallery}/today`}>Today</Link></li></ul>
      <Galleries items={filtered} gallery={gallery} />
    </div>
  )
}

export default AlbumsPage
