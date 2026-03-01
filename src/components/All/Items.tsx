import type { MouseEvent, RefObject } from 'react'
import type { ImageGalleryRef } from 'react-image-gallery'
import { useCallback } from 'react'

import config from '../../../src/models/config'
import type { ServerSideAllItem } from '../../types/common'
import Img from '../Img'
import Link from '../Link'
import styles from './styles.module.css'

const SHOW_THUMB_MIN_LEN = 3

interface InputProps {
  items: ServerSideAllItem[];
  keyword: string;
  refImageGallery: RefObject<ImageGalleryRef | null>;
}

function All({ items, keyword, refImageGallery }: InputProps) {
  const showThumbnail = keyword.length >= SHOW_THUMB_MIN_LEN
  const { width, height } = config.resizeDimensions.thumb

  const selectThumb = useCallback((index: number) => {
    refImageGallery.current?.slideToIndex(index)
  }, [refImageGallery])

  const handleSlideToClick = useCallback((e: MouseEvent<HTMLUListElement>) => {
    const btn = (e.target as HTMLElement).closest('button[data-slide-index]')
    const idx = btn?.getAttribute('data-slide-index')
    if (idx != null) selectThumb(Number(idx))
  }, [selectThumb])

  return (
    <ul onClick={handleSlideToClick}>
      {items.map((item, index) => (
        <li key={item.filename.toString()}>
          <b className={styles.albumName}>{item.album}</b>
          <Link href={`/${item.gallery}/${item.album}?select=${Array.isArray(item.filename) ? item.filename[0] : item.filename}`} title={item.corpus}>
            {!showThumbnail && item.caption}
            {showThumbnail && <Img src={item.thumbPath} alt={item.caption} title={item.corpus} width={width} height={height} />}
          </Link>
          <button className={styles.slideTo} type="button" data-slide-index={index}>Slide to</button>
        </li>
      ))}
    </ul>
  )
}

export default All
