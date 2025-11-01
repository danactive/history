import { RefObject, useEffect, useState } from 'react'
import type ReactImageGallery from 'react-image-gallery'

import Link from '../components/Link'
import type { Item } from '../types/common'
import applyAge from '../utils/person'
import styles from './memory.module.css'

export interface Viewed { (index: number): void }

const useMemory = (
  filtered: Item[],
  refImageGallery: RefObject<ReactImageGallery | null>,
) => {
  const [viewedList, setViewedList] = useState<Set<string>>(new Set())
  const [details, setDetails] = useState<Item | null>(filtered[0] ?? null)

  const resetViewedList = () => {
    setViewedList(new Set())
  }

  const setViewed: Viewed = (index: number) => {
    const item = filtered[index] ?? filtered[0] ?? null
    setDetails(item)
    if (item) {
      const rawId = item.id ?? (Array.isArray(item.filename) ? item.filename.join(',') : String(item.filename))
      if (rawId) {
        setViewedList((prev) => {
          if (prev.has(rawId)) return prev
          const next = new Set(prev)
          next.add(rawId)
          return next
        })
      }
    }
  }

  useEffect(() => {
    if (refImageGallery.current && filtered.length > 0) {
      const current = refImageGallery.current.getCurrentIndex()
      if (current >= 0) setViewed(current)
    } else if (filtered.length > 0) {
      setViewed(0)
    } else {
      setDetails(null)
    }
  }, [filtered, refImageGallery])

  const memoryHtml = details ? (
    <>
      <h3 className={styles.city}>{details.title}</h3>
      {details.persons && (
        <h4 className={styles.person}>
          {applyAge(details.persons, details.filename)}
        </h4>
      )}
      <h5 className={styles.filename}>
        {Array.isArray(details.filename) ? details.filename.join(', ') : String(details.filename)}
      </h5>
      {details.reference && details.reference.length >= 2 && (
        <Link href={details.reference[0]}>
          {decodeURI(details.reference[1]).replaceAll('_', ' ')}
        </Link>
      )}
    </>
  ) : null

  return {
    setViewed,
    resetViewedList,
    memoryHtml,
    viewedList,
  }
}

export default useMemory
