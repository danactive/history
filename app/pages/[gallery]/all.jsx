import Head from 'next/head'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

import { get as getAlbum } from '../../src/lib/album'
import { get as getAlbums } from '../../src/lib/albums'
import { get as getGalleries } from '../../src/lib/galleries'

import Link from '../../src/components/Link'

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
  const router = useRouter()
  const [keyword, setKeywordState] = useState(null)
  const checkKeyword = (k = '') => k.length > 2
  const setKeyword = (k = '') => setKeywordState(k)

  useEffect(() => {
    if (router.isReady && keyword) {
      router.query.keyword = keyword
      router.push(router)
      return null
    }
    return null
  }, [keyword])

  if (!router.isReady) {
    return null
  }
  if (router.isReady && keyword === null) {
    setKeyword(router.query.keyword)
    return null
  }
  const filtered = items.filter((item) => {
    const contentWithoutAccentLow = item.content.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    const keywordWithoutAccentLow = keyword.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    return contentWithoutAccentLow.indexOf(keywordWithoutAccentLow) !== -1
  })

  return (
    <div>
      <Head>
        <title>History App - All</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <h3>{keyword} results {filtered?.length} of {items?.length} found</h3>
      <input type="text" onChange={(event) => setKeyword(event.target.value)} value={keyword} />
      <ul>
        {filtered.map((item) => (
          <li key={item.filename}>
            <b>{item.album}</b>
            {item.content}
            {checkKeyword(keyword) ? <img src={item.thumbPath} alt={item.caption} /> : item.caption}
            <Link href={`/${item.gallery}/${item.album}#select${item.id}`}><a>{item.caption}</a></Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default AllPage
