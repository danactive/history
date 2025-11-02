import { RefObject, useEffect, useState } from 'react'
import type ReactImageGallery from 'react-image-gallery'

import Link from '../components/Link'
import type { Item } from '../types/common'
import applyAge from '../utils/person'
import styles from './memory.module.css'

interface Viewed { (index: number): void }

type MemoryOptions = {
  autoInitialView?: boolean // skip auto mark when false
}

const useMemory = (
  filtered: Item[],
  refImageGallery: RefObject<ReactImageGallery | null>,
  options: MemoryOptions = { autoInitialView: true },
) => {
  const { autoInitialView = true } = options // destructure to stabilize dependency
  const [viewedList, setViewedList] = useState<Set<string>>(new Set())
  const [details, setDetails] = useState<Item | null>(filtered[0] ?? null)

  const setViewed: Viewed = (index: number) => {
    const item = filtered[index] ?? null
    setDetails(item)
    if (!item?.id) return
    setViewedList(prev => {
      if (prev.has(item.id)) return prev
      const next = new Set(prev)
      next.add(item.id)
      return next
    })
  }

  useEffect(() => {
    if (!autoInitialView) return
    if (refImageGallery.current && filtered.length > 0) {
      const current = refImageGallery.current.getCurrentIndex()
      if (current >= 0) {
        setViewed(current)
        return
      }
    }
    if (filtered.length > 0) {
      setViewed(0)
    } else {
      setDetails(null)
    }
  }, [filtered, refImageGallery, autoInitialView])

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
    memoryHtml,
    viewedList,
  }
}

export default useMemory
export { type Viewed }
