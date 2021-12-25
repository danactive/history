import Head from 'next/head'

import { get as getAlbum } from '../../src/lib/album'
import { get as getAlbums } from '../../src/lib/albums'
import { get as getGalleries } from '../../src/lib/galleries'

import Link from '../../src/components/Link'
import useSearch from '../../src/hooks/useSearch'
import SplitViewer from '../../src/components/SpiltViewer'

async function buildStaticPaths() {
  const { galleries } = await getGalleries()
  const groups = await Promise.all(galleries.map(async (gallery) => {
    const { albums } = await getAlbums(gallery)
    return albums.map(({ name: album }) => ({ params: { gallery, album } }))
  }))
  return groups.flat()
}

export async function getStaticProps({ params: { gallery } }) {
  const { IMAGE_BASE_URL = '/' } = process.env
  const { albums } = await getAlbums(gallery)

  const prepareItems = ({ albumName, items }) => items.map((item) => ({
    ...item,
    gallery,
    album: albumName,
    photoPath: `${IMAGE_BASE_URL}${item.photoPath}`,
    thumbPath: `${IMAGE_BASE_URL}${item.thumbPath}`,
    content: [item.description, item.caption, item.location, item.city].join(' '),
  }))
  const allItems = await albums.reduce(async (previousPromise, album) => {
    const prev = await previousPromise
    const { album: { items } } = await getAlbum(gallery, album.name)
    return prev.concat(prepareItems({ albumName: album.name, items }))
  }, Promise.resolve([]))

  return {
    props: { items: allItems },
  }
}

export async function getStaticPaths() {
  // Define these albums as allowed, otherwise 404
  return {
    paths: await buildStaticPaths(),
    fallback: false,
  }
}

const AllPage = ({ items = [] }) => {
  const {
    filtered,
    keyword,
    searchBox,
  } = useSearch(items)
  const showThumbnail = (kw = '') => kw.length > 2

  return (
    <div>
      <Head>
        <title>History App - All</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {searchBox}
      <SplitViewer items={filtered} />
      <ul>
        {filtered.map((item) => (
          <li key={item.filename}>
            <b>{item.album}</b>
            {item.content}
            {showThumbnail(keyword) ? <img src={item.thumbPath} alt={item.caption} /> : item.caption}
            <Link href={`/${item.gallery}/${item.album}#select${item.id}`}><a>{item.caption}</a></Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default AllPage
