import { useCallback } from 'react'

import { thumbPath } from '../../lib/paths'
import type { Gallery, RawXmlAlbum, RawXmlItem } from '../../types/common'
import { getPrimaryFilename } from '../../utils'
import styles from '../Album/styles.module.css'
import { ThumbImgList, type ThumbImgProps } from '../ThumbImg'

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

  const handleSelect = useCallback((index: number, e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement | HTMLUListElement>) => {
    const item = items[index]
    if (item) setItem(item, index, e.shiftKey)
  }, [items, setItem])

  const getThumbProps = useCallback((item: RawXmlItem, index: number): ThumbImgProps => {
    const filename = getPrimaryFilename(item.filename)
    const caption = item.thumb_caption || filename
    const isSelected = selectedIndices ? selectedIndices.has(index) : index === currentIndex

    return {
      onSelectWithEvent: handleSelect,
      selectIndex: index,
      src: thumbPath(item.filename, gallery),
      caption,
      viewed: isSelected,
      multiSelected: hasMultiSelection && isSelected,
      editingThumb: true,
    }
  }, [currentIndex, gallery, handleSelect, hasMultiSelection, selectedIndices])

  if (items.length === 0) {
    return <div>No items found</div>
  }

  return (
    <ThumbImgList
      items={items}
      className={styles.thumbWrapper}
      getKey={(item) => getPrimaryFilename(item.filename)}
      getThumbProps={getThumbProps}
    />
  )
}
