import type { Item } from '../../../types/common'
import { getPrimaryFilename } from '../../../utils'

type YearSource = Pick<Item, 'filename' | 'photoDate'>

export function isYearToken(value: string) {
  return /^\d{4}$/.test(value.trim())
}

export function getItemYearFromFilename(item: YearSource): string {
  const filename = getPrimaryFilename(item.filename)
  const year = item.photoDate?.match(/^\d{4}/)?.[0] ?? filename?.toString?.().substring?.(0, 4) ?? ''
  return isYearToken(year) ? year : ''
}

export function addYearToSearch(search: string, item: YearSource): string {
  const year = getItemYearFromFilename(item)
  return year ? `${search}, ${year}` : search
}
