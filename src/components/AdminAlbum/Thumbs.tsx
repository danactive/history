import { type Dispatch, type SetStateAction } from 'react'

import { thumbPath } from '../../lib/paths'
import type { Gallery, RawXmlAlbum } from '../../types/common'
import styles from '../Album/styles.module.css'
import ThumbImg from '../ThumbImg'
import { XmlItemState } from './AdminAlbumClient'

export default function AdminAlbumThumbs(
  { xmlAlbum, gallery, setItem }:
  { xmlAlbum: RawXmlAlbum, gallery: Gallery, setItem: Dispatch<SetStateAction<XmlItemState>> },
) {
  const items = xmlAlbum.album.item ? (Array.isArray(xmlAlbum.album.item) ? xmlAlbum.album.item : [xmlAlbum.album.item]) : []

  if (items.length === 0) {
    return <div>No items found</div>
  }

  return (
    <>
      <ul className={styles.thumbWrapper}>
        {items.map((item) => {
          const filename = Array.isArray(item.filename) ? item.filename[0] : item.filename
          return (
            <ThumbImg
              onClick={() => setItem(item)}
              src={thumbPath(item.filename, gallery)}
              caption={item.thumb_caption}
              key={filename}
              id={`select${item.$.id}`}
              viewed={false}
            />
          )
        })}
      </ul>
    </>
  )
}
