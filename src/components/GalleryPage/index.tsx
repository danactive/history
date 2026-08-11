'use client'

import type { Metadata } from 'next'

import useSearch from '../../hooks/useSearch'
import type { Gallery } from '../../types/pages'
import Galleries from '../Albums'
import Link from '../Link'
import FilterArea from '../Search/FilterArea'
import styles from './styles.module.css'

export const metadata: Metadata = {
  title: 'List Albums - History App',
}

export default function GalleryClient({ gallery, albums, indexedKeywords, personOptions, tagOptions }: Gallery.ComponentProps) {
  const {
    filtered,
    searchBox,
  } = useSearch({
    gallery,
    items: albums,
    summaryLabel: 'Albums',
    indexedKeywords,
    personOptions,
    tagOptions,
    ownedPersonFilter: true,
    trailingAction: <Link href={`/${gallery}/details`}>Gallery details</Link>,
  })

  return (
    <>
      <FilterArea
        searchControls={searchBox}
        contextualControls={(
          <ul className={styles.row}>
            <li className={styles.rowLabel}>View</li>
            <li className={styles.rowItem}><Link className={styles.viewLink} href={`/${gallery}/all`}>All</Link></li>
            <li className={styles.rowItem}><Link className={styles.viewLink} href={`/${gallery}/today`}>Today</Link></li>
            <li className={styles.rowItem}><Link className={styles.viewLink} href={`/${gallery}/persons`}>Persons</Link></li>
            <li className={styles.rowItem}><Link className={styles.viewLink} href={`/${gallery}/visited`}>Visited</Link></li>
          </ul>
        )}
      />
      <Galleries items={filtered} gallery={gallery} />
    </>
  )
}
