import Head from 'next/head'

import { get as getAlbum } from '../../src/lib/album'
import { get as getAlbums } from '../../src/lib/albums'
import { get as getGalleries } from '../../src/lib/galleries'

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
  }))
  return {
    props: { album: { ...albumDoc, items: prepareItems } },
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
        <li key={item.filename} id={`select${item.id}`}>
          {item.city}
          <img src={item.thumbPath} alt={item.caption} />
          {item?.geo?.lat}, {item?.geo?.lon}
        </li>
      ))}
    </ul>
  </div>
)

export default AlbumPage
