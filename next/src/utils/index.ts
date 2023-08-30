import type { Item } from '../types/common'

export function getExt(filenames: Item['filename']) {
  if (!filenames) return null
  const filename = Array.isArray(filenames) ? filenames[0] : filenames
  const extDot = filename.lastIndexOf('.') + 1
  const extension = filename.substring(extDot)
  return extension.toLowerCase()
}

export const removeUndefinedFields = <T>(obj: T): T => Object.keys(obj as object | {}).reduce(
  (acc, key) => (obj[key as keyof T] === undefined
    ? { ...acc }
    : { ...acc, [key]: obj[key as keyof T] }),
    {} as T,
)

export function isNotEmpty(value: unknown): value is string {
  if (typeof value !== 'undefined' || value !== null || value !== '') {
    return true
  }
  return false
}
