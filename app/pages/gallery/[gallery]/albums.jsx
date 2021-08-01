import Head from 'next/head'
import styled, { css } from 'styled-components'

import { get as getAlbums } from '../../../src/lib/albums'
import { get as getGalleries } from '../../../src/lib/galleries'

export async function getStaticProps({ params: { gallery } }) {
  const { albums } = await getAlbums(gallery)
  return {
    props: { albums },
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

const AlbumsPage = ({ albums }) => {
  const albumGroup = albums.map((album, i) => (
    <Albums
      key={album.name}
      odd={i % 2 === 0}
    >
      <img src={album.thumbPath} alt={album.name} />
      <AlbumTitle>{album.h1}</AlbumTitle>
      <AlbumSubTitle>{album.h2}</AlbumSubTitle>
      <AlbumYear>{album.year}</AlbumYear>
    </Albums>
  ))

  return (
    <div>
      <Head>
        <title>History App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div>{albumGroup}</div>
    </div>
  )
}

export default AlbumsPage
