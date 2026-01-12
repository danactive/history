import { thumbPath } from '../../lib/paths'
import type { Gallery, RawXmlAlbum, RawXmlItem } from '../../types/common'
import styles from '../Album/styles.module.css'
import ThumbImg from '../ThumbImg'

export default function AdminAlbumThumbs(
  { xmlAlbum, gallery, setItem, currentIndex }:
  { xmlAlbum: RawXmlAlbum, gallery: Gallery, setItem: (item: RawXmlItem, index: number) => void, currentIndex: number },
) {
  const items = xmlAlbum.album.item ? (Array.isArray(xmlAlbum.album.item) ? xmlAlbum.album.item : [xmlAlbum.album.item]) : []

  if (items.length === 0) {
    return <div>No items found</div>
  }

  return (
    <>
      <ul className={styles.thumbWrapper}>
        {items.map((item, index) => {
          const filename = Array.isArray(item.filename) ? item.filename[0] : item.filename
          const caption = item.thumb_caption || filename
          const isSelected = index === currentIndex
          return (
            <ThumbImg
              onClick={() => setItem(item, index)}
              src={thumbPath(item.filename, gallery)}
              caption={caption}
              key={filename}
              id={`select${item.$.id}`}
              viewed={isSelected}
            />
          )
        })}
      </ul>
    </>
  )
}
