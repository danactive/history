import type { ServerSideAllItem, VisitedPlace } from '../types/common'
import type { All } from '../types/pages'
import { filterItemsByVisitedPlace, formatVisitedPlace } from './domains/visited'
import { allPageItemMapper, getAllItems } from './get-all-items'
import { buildFilterMetadata } from './server/filter-metadata'

export function filterAllItemsByVisitedPlace(items: ServerSideAllItem[], visitedPlace: VisitedPlace) {
  return filterItemsByVisitedPlace(items, visitedPlace)
}

export async function getAllData({ gallery, visitedPlace }: All.Params): Promise<All.ItemData> {
  const data = await getAllItems(gallery, allPageItemMapper, true)

  if (!visitedPlace) {
    return {
      ...data,
      visitedPlace: null,
      visitedFilterLabel: null,
    }
  }

  const items = filterAllItemsByVisitedPlace(data.items, visitedPlace)
  const { indexedKeywords } = buildFilterMetadata(items)
  return {
    gallery,
    items,
    indexedKeywords,
    totalItemCount: data.items.length,
    visitedPlace,
    visitedFilterLabel: formatVisitedPlace(visitedPlace),
  }
}
