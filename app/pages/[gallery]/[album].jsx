import Head from 'next/head'

import { get as getAlbum } from '../../src/lib/album'
import { get as getAlbums } from '../../src/lib/albums'
import { get as getGalleries } from '../../src/lib/galleries'

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

const AlbumPage = ({ items = [] }) => {
  const {
    filtered,
    keyword,
    setKeyword,
    shareUrlStem,
  } = useSearch(items)
  const keywordResultLabel = keyword === '' ? null : (<> for &quot;{keyword}&quot;</>)

  return (
    <div>
      <Head>
        <title>History App - Album</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <h3>Search results {filtered?.length} of {items?.length}{keywordResultLabel}</h3>
      <nav>{shareUrlStem}</nav>
      <input type="text" onChange={(event) => setKeyword(event.target.value)} value={keyword} />
      <ul>
        {filtered.map((item) => (
          <li key={item.filename} id={`select${item.id}`}>
            {item.city}
            <img src={item.thumbPath} alt={item.caption} />
            {item?.geo?.lat}, {item?.geo?.lon}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default AlbumPage
