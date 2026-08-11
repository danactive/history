import type { Item } from '../types/common'

export function getPrimaryFilename(filenames: Item['filename'] | null | undefined) {
  if (!filenames) return ''
  return Array.isArray(filenames) ? filenames[0] ?? '' : filenames
}

export function getExt(filenames: Item['filename']) {
  if (!filenames) return null
  const filename = getPrimaryFilename(filenames)
  const extDot = filename.lastIndexOf('.') + 1
  const extension = filename.substring(extDot)
  return extension.toLowerCase()
}

type AlbumYearSortable = {
  year?: string | null;
}

type ChronologicalSortable = {
  filename: Item['filename'];
  photoDate?: string | null;
  id: string;
}

const compareNatural = (left: string, right: string) => left.localeCompare(
  right,
  undefined,
  { numeric: true, sensitivity: 'base' },
)

function getMostRecentAlbumYear(year?: string | null) {
  const years = year?.match(/\b\d{4}\b/g)?.map(Number) ?? []
  return years.length > 0 ? Math.max(...years) : null
}

export function compareAlbumYearNewestFirst<T extends AlbumYearSortable>(left: T, right: T) {
  const leftYear = getMostRecentAlbumYear(left.year)
  const rightYear = getMostRecentAlbumYear(right.year)

  if (leftYear === null) return rightYear === null ? 0 : 1
  if (rightYear === null) return -1
  return rightYear - leftYear
}

function compareWithEmptyLast(left: string, right: string) {
  if (!left) return right ? 1 : 0
  if (!right) return -1
  return compareNatural(left, right)
}

export function compareItemOldestFirst<T extends ChronologicalSortable>(left: T, right: T) {
  const dateOrder = compareWithEmptyLast(
    left.photoDate || getPrimaryFilename(left.filename),
    right.photoDate || getPrimaryFilename(right.filename),
  )
  if (dateOrder !== 0) return dateOrder

  const filenameOrder = compareWithEmptyLast(
    getPrimaryFilename(left.filename),
    getPrimaryFilename(right.filename),
  )
  if (filenameOrder !== 0) return filenameOrder

  return compareNatural(left.id, right.id)
}

export const removeUndefinedFields = <T>(obj: T): T => Object.keys(obj as object | {}).reduce(
  (acc, key) => (obj[key as keyof T] === undefined
    ? { ...acc }
    : { ...acc, [key]: obj[key as keyof T] }),
    {} as T,
)

export function isNotEmpty(value: unknown): value is string {
  if (typeof value !== 'undefined' && value !== null && value !== '' && value !== undefined) {
    return true
  }
  return false
}
