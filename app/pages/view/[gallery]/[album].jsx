import Head from 'next/head'

import { get as getAlbum } from '../../../src/lib/album'
// import { get as getAlbums } from '../../../src/lib/albums'
// import { get as getGalleries } from '../../../src/lib/galleries'

// async function buildStaticPaths() {
//   const { galleries } = await getGalleries()
//   // Define these albums as allowed, otherwise 404
//   const promises = galleries.reduce(async (accumulator, gallery) => {
//     const { albums } = await getAlbums(gallery)
//     return albums.map((album) => ({ params: { gallery, album } }))
//   }, [])
//
//   const paths = await Promise.all(promises)
//   return paths
// }

export async function getStaticProps({ params: { gallery, album } }) {
  const json = await getAlbum(gallery, album)
  return {
    props: json,
  }
}

export async function getStaticPaths() {
  const paths = [{ params: { gallery: 'demo', album: 'sample' } }]
  return {
    paths,
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
      {album.items.map((item) => (
        <li key={item.filename}>{item.city} <img src={item.thumbPath} alt={item.caption} /> {item?.geo?.lat}, {item?.geo?.lon}</li>
      ))}
    </ul>
  </div>
)

export default AlbumPage
