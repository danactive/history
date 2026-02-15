import { thumbPath } from '../../lib/paths'
import type { Gallery, RawXmlAlbum, RawXmlItem } from '../../types/common'
import styles from '../Album/styles.module.css'
import ThumbImg from '../ThumbImg'

export default function AdminAlbumThumbs(
  { xmlAlbum, gallery, setItem, currentIndex, selectedIndices }:
  {
    xmlAlbum: RawXmlAlbum,
    gallery: Gallery,
    setItem: (item: RawXmlItem, index: number, isShift?: boolean) => void,
    currentIndex: number,
    selectedIndices?: Set<number>
  },
) {
  const items = xmlAlbum?.album?.item
    ? (Array.isArray(xmlAlbum.album.item) ? xmlAlbum.album.item : [xmlAlbum.album.item])
    : []
  const hasMultiSelection = (selectedIndices?.size ?? 0) > 1

  if (items.length === 0) {
    return <div>No items found</div>
  }

  return (
    <>
      <ul className={styles.thumbWrapper}>
        {items.map((item, index) => {
          const filename = Array.isArray(item.filename) ? item.filename[0] : item.filename
          const caption = item.thumb_caption || filename
          const isSelected = selectedIndices ? selectedIndices.has(index) : index === currentIndex
          return (
            <ThumbImg
              onClick={(e) => setItem(item, index, e.shiftKey)}
              src={thumbPath(item.filename, gallery)}
              caption={caption}
              key={filename}
              viewed={isSelected}
              multiSelected={hasMultiSelection && isSelected}
              editingThumb
            />
          )
        })}
      </ul>
    </>
  )
}
