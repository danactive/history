import type { ServerSideAllItem, VisitedPlace } from '../types/common'
import type { All } from '../types/pages'
import { allPageItemMapper, getAllItems } from './get-all-items'
import indexKeywords from './search'
import { matchesVisitedPlace } from './visited'

export function filterAllItemsByVisitedPlace(items: ServerSideAllItem[], visitedPlace: VisitedPlace) {
  return items.filter(item => matchesVisitedPlace(item.visitedPlace, visitedPlace))
}

export async function getAllData({ gallery, visitedPlace }: All.Params): Promise<All.ItemData> {
  const data = await getAllItems(gallery, allPageItemMapper, true)

  if (!visitedPlace) {
    return data
  }

  const items = filterAllItemsByVisitedPlace(data.items, visitedPlace)
  const { indexedKeywords } = indexKeywords(items)
  return { gallery, items, indexedKeywords }
}
