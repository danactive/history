import type { ServerSideAllItem, VisitedPlace } from '../types/common'
import type { All } from '../types/pages'
import { filterItemsBySelectedPerson } from './filter-selected-person'
import { filterItemsByVisitedPlace, formatVisitedPlace } from './domains/visited'
import { allPageItemMapper, getAllItems } from './get-all-items'
import { buildFilterMetadata } from './server/filter-metadata'

export function filterAllItemsByVisitedPlace(items: ServerSideAllItem[], visitedPlace: VisitedPlace) {
  return filterItemsByVisitedPlace(items, visitedPlace)
}

export async function getAllData({ gallery, visitedPlace, selectedPerson }: All.Params & { selectedPerson?: string | null }): Promise<All.ItemData> {
  const data = await getAllItems(gallery, allPageItemMapper, true)

  const visitedScopedItems = visitedPlace
    ? filterAllItemsByVisitedPlace(data.items, visitedPlace)
    : data.items
  const scopedItems = filterItemsBySelectedPerson(visitedScopedItems, selectedPerson ?? null)

  if (!visitedPlace && !selectedPerson) {
    return {
      ...data,
      visitedPlace: null,
      visitedFilterLabel: null,
    }
  }

  const { indexedKeywords } = buildFilterMetadata(scopedItems)
  return {
    gallery,
    items: scopedItems,
    indexedKeywords,
    totalItemCount: data.items.length,
    visitedPlace: visitedPlace ?? null,
    visitedFilterLabel: visitedPlace ? formatVisitedPlace(visitedPlace) : null,
  }
}
