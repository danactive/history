'use client'

import type { Metadata } from 'next'
import useSearch from '../../hooks/useSearch'
import type { Gallery } from '../../types/pages'
import Galleries from '../Albums'
import Link from '../Link'
import styles from './styles.module.css'

export const metadata: Metadata = {
  title: 'List Albums - History App',
}

function GalleryPage({ gallery, albums, indexedKeywords }: Gallery.ComponentProps) {
  const {
    filtered,
    searchBox,
  } = useSearch({ items: albums, indexedKeywords })

  return (
    <>
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
