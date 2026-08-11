import type { RefObject } from 'react'
import type { ImageGalleryRef } from 'react-image-gallery'
import { useCallback } from 'react'

import type { ServerSideAllItem } from '../../types/common'
import { getPrimaryFilename } from '../../utils'
import Link from '../Link'
import { ThumbImgList, type ThumbImgProps } from '../ThumbImg'
import styles from './styles.module.css'

interface InputProps {
  items: ServerSideAllItem[];
  refImageGallery: RefObject<ImageGalleryRef | null>;
  viewedList: Set<string>;
  onSelectItem?: (item: ServerSideAllItem) => void;
}

export function renderAlbumCaptionAction(
  gallery: ServerSideAllItem['gallery'],
  album: ServerSideAllItem['album'],
  filename: ServerSideAllItem['filename'],
  corpus: ServerSideAllItem['corpus'],
) {
  if (!album) {
    return null
  }

  return (
    <Link href={`/${gallery}/${album}?select=${getPrimaryFilename(filename)}`} title={corpus}>
      {album}
    </Link>
  )
}

function All({ items, refImageGallery, viewedList, onSelectItem }: InputProps) {
  const selectThumb = useCallback((index: number) => {
    const item = items[index]
    if (item && onSelectItem) {
      onSelectItem(item)
      return
    }
    refImageGallery.current?.slideToIndex(index)
  }, [items, onSelectItem, refImageGallery])

  const getThumbProps = useCallback((item: ServerSideAllItem, index: number): ThumbImgProps => ({
    onSelectIndex: selectThumb,
    selectIndex: index,
    src: item.thumbPath,
    caption: item.caption,
    viewed: viewedList.has(item.id),
    captionAction: renderAlbumCaptionAction(item.gallery, item.album, item.filename, item.corpus),
  }), [selectThumb, viewedList])

  return (
    <ThumbImgList
      items={items}
      className={styles.thumbWrapper}
      getKey={(item) => item.filename.toString()}
      getThumbProps={getThumbProps}
      virtualize
    />
  )
}

export default All
