import Head from 'next/head'

import { get as getAlbum } from '../../../src/lib/album'
import { get as getAlbums } from '../../../src/lib/albums'
import { get as getGalleries } from '../../../src/lib/galleries'

async function buildStaticPaths() {
  const { galleries } = await getGalleries()
  const groups = await Promise.all(galleries.map(async (gallery) => {
    const { albums } = await getAlbums(gallery)
    return albums.map(({ name: album }) => ({ params: { gallery, album } }))
  }))
  return groups.flat()
}

export async function getStaticProps({ params: { gallery, album } }) {
  return {
    props: await getAlbum(gallery, album),
  }
}

export async function getStaticPaths() {
  // Define these albums as allowed, otherwise 404
  return {
    paths: await buildStaticPaths(),
    fallback: false,
  }
}

const AlbumPage = ({ album }) => (
  <div>
    <Head>
      <title>History App - Album</title>
      <link rel="icon" href="/favicon.ico" />
    </Head>

    <ul>
      {album?.items?.map((item) => (
        <li key={item.filename}>{item.city} <img src={item.thumbPath} alt={item.caption} /> {item?.geo?.lat}, {item?.geo?.lon}</li>
      ))}
    </ul>
  </div>
)

export default AlbumPage
