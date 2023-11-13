import type { GetStaticPaths, GetStaticProps } from 'next'
import Head from 'next/head'
import { type ParsedUrlQuery } from 'node:querystring'
import styled, { css } from 'styled-components'

import config from '../../config.json'
import getAlbums from '../src/lib/albums'
import getGalleries from '../src/lib/galleries'
import indexKeywords from '../src/lib/search'

import Img from '../src/components/Img'
import Link from '../src/components/Link'
import useSearch from '../src/hooks/useSearch'
import type { AlbumMeta, GalleryAlbum } from '../src/types/common'

interface ServerSideAlbumItem extends GalleryAlbum {
  corpus: string;
}

type ComponentProps = {
  gallery: NonNullable<AlbumMeta['gallery']>;
  albums: ServerSideAlbumItem[];
  indexedKeywords: object[];
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

const Albums = styled.div<{ $odd: boolean }>`
  float: left;
  width: 185px;
  height: 170px;
  padding: 10px;
  background: peachpuff;
  ${(props) => props.$odd && css`
    background-color: linen;
  `}
`
const AlbumTitle = styled.h1`
  font-size: 1.1rem;
  font-family: "Trebuchet MS",sans-serif;
`
const AlbumSubTitle = styled.h2`
  font-size: 0.75rem;
  font-family: Verdana,sans-serif;
  color: #8B7765;
`
const AlbumYear = styled.h3`
  font-size: 0.9rem;
  font-family: "Trebuchet MS",sans-serif;
  color: #8B5A2B;
`

function AlbumsPage({ gallery, albums, indexedKeywords }: ComponentProps) {
  const {
    filtered,
    searchBox,
  } = useSearch({ items: albums, indexedKeywords })
  const { width, height } = config.resizeDimensions.thumb

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
      {filtered.map((album, i) => (
        <Albums
          key={album.name}
          $odd={i % 2 === 0}
        >
          <Link href={`/${gallery}/${album.name}`}><Img src={album.thumbPath} alt={album.name} width={width} height={height} /></Link>
          <AlbumTitle>{album.h1}</AlbumTitle>
          <AlbumSubTitle>{album.h2}</AlbumSubTitle>
          <AlbumYear>{album.year}</AlbumYear>
        </Albums>
      ))}
    </div>
  )
}

export default AlbumsPage
