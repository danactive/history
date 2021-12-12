import Head from 'next/head'
import styled from 'styled-components'

import { get as getAlbum } from '../../src/lib/album'
import { get as getAlbums } from '../../src/lib/albums'
import { get as getGalleries } from '../../src/lib/galleries'

import ThumbImg from '../../src/components/ThumbImg'
import useSearch from '../../src/hooks/useSearch'

async function buildStaticPaths() {
  const { galleries } = await getGalleries()
  const groups = await Promise.all(galleries.map(async (gallery) => {
    const { albums } = await getAlbums(gallery)
    return albums.map(({ name: album }) => ({ params: { gallery, album } }))
  }))
  return groups.flat()
}

export async function getStaticProps({ params: { gallery, album } }) {
  const { IMAGE_BASE_URL = '/' } = process.env
  const { album: albumDoc } = await getAlbum(gallery, album)
  const prepareItems = albumDoc.items.map((item) => ({
    ...item,
    thumbPath: `${IMAGE_BASE_URL}${item.thumbPath}`,
    content: [item.description, item.caption, item.location, item.city].join(' '),
  }))
  return {
    props: { items: prepareItems },
  }
}

export async function getStaticPaths() {
  // Define these albums as allowed, otherwise 404
  return {
    paths: await buildStaticPaths(),
    fallback: false,
  }
}

const Wrapper = styled.ul`
  list-style: none;
  padding-left: 2px;
`

const AlbumPage = ({ items = [] }) => {
  const {
    filtered,
    searchBox,
  } = useSearch(items)

  return (
    <div>
      <Head>
        <title>History App - Album</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {searchBox}
      <Wrapper>
        {filtered.map((item) => (
          <ThumbImg src={item.thumbPath} caption={item.caption} key={item.filename} id={`select${item.id}`} />
        ))}
      </Wrapper>
    </div>
  )
}

export default AlbumPage
