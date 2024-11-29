import Head from 'next/head'

import useSearch from '../../hooks/useSearch'
import { Gallery } from '../../types/pages'
import Galleries from '../Albums'
import Link from '../Link'

function GalleryPage({ gallery, albums, indexedKeywords }: Gallery.ComponentProps) {
  const {
    filtered,
    searchBox,
  } = useSearch({ items: albums, indexedKeywords })

  return (
    <>
      <Head>
        <title>History App - List Albums</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div>{searchBox}</div>
      <ul>
        <li>View <Link href={`/${gallery}/all`}>All</Link></li>
        <li><Link href={`/${gallery}/today`}>Today</Link></li>
        <li><Link href={`/${gallery}/age`}>by Age</Link></li>
      </ul>
      <Galleries items={filtered} gallery={gallery} />
    </>
  )
}

export default GalleryPage
