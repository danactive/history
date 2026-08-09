import { getItemYearFromFilename } from './domains/years'
import { getVideoPaths, photoPath, thumbPath } from './paths'
import type { Gallery, ServerSideAllItem } from '../types/common'

type DerivedAllItemField = keyof Pick<ServerSideAllItem,
  | 'corpus'
  | 'gallery'
  | 'mediaPath'
  | 'photoPath'
  | 'thumbPath'
  | 'title'
  | 'videoPaths'
>

export type CompactAllPageItem = Omit<ServerSideAllItem, DerivedAllItemField> & {
  isVideo: boolean;
}

export function compactAllPageItem(item: ServerSideAllItem): CompactAllPageItem {
  const {
    corpus: _corpus,
    gallery: _gallery,
    mediaPath,
    photoPath: itemPhotoPath,
    thumbPath: _thumbPath,
    title: _title,
    videoPaths: _videoPaths,
    ...compactItem
  } = item

  return {
    ...compactItem,
    isVideo: mediaPath !== itemPhotoPath,
  }
}

export function compactAllPageItems(items: ServerSideAllItem[]) {
  return items.map(compactAllPageItem)
}

function getItemTitle(item: Pick<CompactAllPageItem, 'city' | 'location'>) {
  if (item.location && item.city) return `${item.location} (${item.city})`
  return item.location || item.city
}

export function expandAllPageItem(
  item: CompactAllPageItem,
  gallery: Gallery,
): ServerSideAllItem {
  const itemPhotoPath = photoPath(item.filename, gallery)
  const itemVideoPaths = getVideoPaths(item.filename, gallery)
  const corpus = [
    item.description ?? '',
    item.caption,
    item.location ?? '',
    item.city,
    item.search ?? '',
    getItemYearFromFilename(item),
  ].join(' ').trim()

  const { isVideo, ...baseItem } = item
  return {
    ...baseItem,
    corpus,
    gallery,
    mediaPath: isVideo ? itemVideoPaths[0] : itemPhotoPath,
    photoPath: itemPhotoPath,
    thumbPath: thumbPath(item.filename, gallery),
    title: getItemTitle(item),
    videoPaths: itemVideoPaths,
  }
}

export function expandAllPageItems(items: CompactAllPageItem[], gallery: Gallery) {
  return items.map(item => expandAllPageItem(item, gallery))
}
