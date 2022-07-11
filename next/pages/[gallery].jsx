import Head from 'next/head'
import styled, { css } from 'styled-components'

import { get as getAlbums } from '../src/lib/albums'
import { get as getGalleries } from '../src/lib/galleries'

import ThumbImg from '../src/components/ThumbImg'
import Link from '../src/components/Link'
import useSearch from '../src/hooks/useSearch'

export async function getStaticProps({ params: { gallery } }) {
  const { albums } = await getAlbums(gallery)
  const preparedAlbums = albums.map((album) => ({
    ...album,
    corpus: [album.h1, album.h2, album.year].join(' '),
  }))
  return {
    props: { gallery, albums: preparedAlbums },
  }
}

export async function getStaticPaths() {
  const { galleries } = await getGalleries()
  // Define these galleries as allowed, otherwise 404
  const paths = galleries.map((gallery) => ({ params: { gallery } }))
  return {
    paths,
    fallback: false,
  }
}

const Albums = styled.div`
  float: left;
  width: 185px;
  height: 170px;
  padding: 10px;
  background: peachpuff;
  ${({ odd }) => odd && css`
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

function AlbumsPage({ gallery, albums }) {
  const {
    filtered,
    searchBox,
  } = useSearch(albums)
  const AlbumSet = () => filtered.map((album, i) => (
    <Albums
      key={album.name}
      odd={i % 2 === 0}
    >
      <Link href={`/${gallery}/${album.name}`}><ThumbImg src={album.thumbPath} alt={album.name} /></Link>
      <AlbumTitle>{album.h1}</AlbumTitle>
      <AlbumSubTitle>{album.h2}</AlbumSubTitle>
      <AlbumYear>{album.year}</AlbumYear>
    </Albums>
  ))

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
      <AlbumSet />
    </div>
  )
}

export default AlbumsPage
