import type ReactImageGallery from 'react-image-gallery'

import config from '../../../src/models/config'
import type { ServerSideAllItem } from '../../types/common'
import Img from '../Img'
import Link from '../Link'
import ThumbImg from '../ThumbImg'
import styles from './styles.module.css'

interface InputProps {
  items: ServerSideAllItem[]
  keyword: string
  refImageGallery: React.RefObject<ReactImageGallery | null>
}

export default function AllItems({
  items,
  keyword,
  refImageGallery,
  resetToken,
}: InputProps) {
  const showThumbnail = (kw = '') => kw.length > 2
  const { width, height } = config.resizeDimensions.thumb
  function selectThumb(index: number) {
    refImageGallery.current?.slideToIndex(index)
  }

  return (
    <ul>
      {items.map((item, index) => (
        <li key={item.filename.toString()}>
          <b className={styles.albumName}>{item.album}</b>
          <Link href={`/${item.gallery}/${item.album}?select=${item.id}`} title={item.corpus}>
            {!showThumbnail(keyword) && item.caption}
            {showThumbnail(keyword) && <Img src={item.thumbPath} alt={item.caption} title={item.corpus} width={width} height={height} />}
          </Link>
          <button className={styles.slideTo} type="button" onClick={() => selectThumb(index)}><a>Slide to</a></button>
        </li>
      ))}
    </ul>
  )
}
