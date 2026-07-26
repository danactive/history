import type { IndexedKeywords } from '../../../types/common'
import { buildVisitedKeywordOptions } from '../../visited-core'

type SearchOptionItem = {
  city?: string
  filename?: string | string[]
  photoDate?: string | null
}

type VisitedSearchOptionItem = SearchOptionItem & {
  city: string
  filename: string | string[]
  photoDate: string | null
}

function hasCityAndFilename(item: SearchOptionItem): item is VisitedSearchOptionItem {
  return typeof item.city === 'string' && Boolean(item.filename)
}

export function buildSearchOptions<ItemType extends SearchOptionItem>(
  items: ItemType[],
  indexedKeywords: IndexedKeywords[] = [],
) {
  const visitedOptions = buildVisitedKeywordOptions(
    items
      .filter(hasCityAndFilename)
      .map((item): VisitedSearchOptionItem => ({
        city: item.city!,
        filename: item.filename!,
        photoDate: item.photoDate ?? null,
      })),
  )

  const options = new Map<string, IndexedKeywords>()

  indexedKeywords.forEach((option) => {
    options.set(option.value, option)
  })

  visitedOptions.forEach((option) => {
    options.set(option.value, option)
  })

  return [...options.values()]
}
