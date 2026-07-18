import type { StoryMoment } from '../models/storytelling'
import type { Gallery, Item, ServerSideAllItem } from '../types/common'
import { getPrimaryFilename } from '../utils'
import { getVisitedPlace } from './visited'
import type { VisitedRegionCountryIndex } from './visited'

type StoryCandidate = Omit<StoryMoment, 'score' | 'reasons'>

const asArray = <T>(value: T | T[] | null | undefined): T[] => {
  if (value === null || value === undefined) return []
  return Array.isArray(value) ? value : [value]
}

const getFilename = (item: Pick<Item, 'filename'> | Pick<ServerSideAllItem, 'filename'>) => getPrimaryFilename(item.filename)

const getTitle = (item: Pick<Item, 'title'> | Pick<ServerSideAllItem, 'title'>) => asArray(item.title)[0] ?? ''

const getPersonNames = (item: Pick<Item, 'persons'> | Pick<ServerSideAllItem, 'persons'>) => item.persons?.map((person) => person.full) ?? []

const getItemDate = (item: Pick<Item, 'photoDate' | 'filename'> | Pick<ServerSideAllItem, 'photoDate' | 'filename'>) => {
  if (item.photoDate) {
    return item.photoDate
  }

  const filename = getFilename(item)
  const maybeDate = filename.match(/^\d{4}-\d{2}-\d{2}/)
  return maybeDate?.[0] ?? null
}

const getMonthDay = (item: Pick<Item, 'photoDate' | 'filename'> | Pick<ServerSideAllItem, 'photoDate' | 'filename'>) => {
  const date = getItemDate(item)
  return date?.substring(5, 10) ?? null
}

const buildStoryMoment = (candidate: StoryCandidate, score: number, reasons: string[]): StoryMoment => ({
  ...candidate,
  score,
  reasons,
})

const mapAlbumItemToCandidate = (
  gallery: Gallery,
  album: string,
  item: Item,
  regionCountryIndex: VisitedRegionCountryIndex,
): StoryCandidate => ({
  gallery,
  album,
  filename: getFilename(item),
  date: getItemDate(item),
  title: getTitle(item),
  caption: item.caption,
  description: item.description,
  city: item.city,
  location: item.location,
  persons: getPersonNames(item),
  mediaPath: item.mediaPath,
  thumbPath: item.thumbPath,
  reference: item.reference,
  visitedPlace: getVisitedPlace(item, regionCountryIndex),
})

const mapAllItemToCandidate = (item: ServerSideAllItem): StoryCandidate => ({
  gallery: item.gallery as Gallery,
  album: item.album ?? null,
  filename: getFilename(item),
  date: getItemDate(item),
  title: getTitle(item),
  caption: item.caption,
  description: item.description,
  city: item.city,
  location: item.location,
  persons: getPersonNames(item),
  mediaPath: item.mediaPath,
  thumbPath: item.thumbPath,
  reference: item.reference,
  visitedPlace: item.visitedPlace,
})

export {
  buildStoryMoment,
  getItemDate,
  getMonthDay,
  getPersonNames,
  mapAlbumItemToCandidate,
  mapAllItemToCandidate,
}

export type { StoryCandidate }
