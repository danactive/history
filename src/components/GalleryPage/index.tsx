import Head from 'next/head'

import useSearch from '../../hooks/useSearch'
import type { Gallery } from '../../types/pages'
import Galleries from '../Albums'
import Link from '../Link'
import styles from './styles.module.css'

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
      <ul className={styles.row}>
        <li className={styles.rowItem}>View:</li>
        <li className={styles.rowItem}><Link href={`/${gallery}/all`}>All</Link></li>
        <li className={styles.rowItem}><Link href={`/${gallery}/today`}>Today</Link></li>
        <li className={styles.rowItem}><Link href={`/${gallery}/persons`}>Persons</Link></li>
      </ul>
      <Galleries items={filtered} gallery={gallery} />
    </>
  )
}

export default GalleryPage
