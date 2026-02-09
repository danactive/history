import { RefObject, useEffect, useState } from 'react'
import type { ImageGalleryRef } from 'react-image-gallery'

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
  refImageGallery: RefObject<ImageGalleryRef | null>,
  options: MemoryOptions = { autoInitialView: true },
) => {
  const { autoInitialView = true } = options
  const [viewedList, setViewedList] = useState<Set<string>>(new Set())
  const [details, setDetails] = useState<Item | null>(filtered[0] ?? null)

  const setViewed: Viewed = (index: number) => {
    if (index < 0 || index >= filtered.length) return
    const item = filtered[index]
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
    if (!autoInitialView || filtered.length === 0) {
      if (filtered.length === 0) setDetails(null)
      return
    }
    // Do NOT mark viewed if gallery will immediately trigger onSlide (AlbumClient select flow).
    // Leave initial mark for gallery except fallback to index 0 when no ref/index yet.
    const galleryIndex = refImageGallery.current?.getCurrentIndex?.() ?? 0
    if (galleryIndex >= 0 && galleryIndex < filtered.length) {
      setViewed(galleryIndex)
    } else {
      setViewed(0)
    }
  }, [filtered, refImageGallery, autoInitialView])

  const memoryHtml = details ? (
    <div data-type="memory-details">
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
        <Link href={details.reference[0]} target='_blank' rel="noopener noreferrer">
          {decodeURI(details.reference[1]).replaceAll('_', ' ')}
        </Link>
      )}
    </div>
  ) : null

  return { setViewed, memoryHtml, viewedList }
}

export default useMemory
export { type Viewed }
