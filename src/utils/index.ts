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

type NewestSortable = {
  filename: Item['filename'];
  id: string;
}

export function compareNewestFirst<T extends NewestSortable>(left: T, right: T) {
  const filenameOrder = getPrimaryFilename(right.filename).localeCompare(
    getPrimaryFilename(left.filename),
    undefined,
    { numeric: true, sensitivity: 'base' },
  )

  if (filenameOrder !== 0) {
    return filenameOrder
  }

  return right.id.localeCompare(left.id, undefined, { numeric: true, sensitivity: 'base' })
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
