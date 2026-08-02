import type { All } from '../types/pages'
import type { GalleryParams } from './server/page-route'
import { filterItemsByQuery, getFilterQueryContext, parseFilterQuery } from './filter-query'
import { filterItemsByMapBounds, type Bounds } from './map-filtering'
import { allPageItemMapper, getAllItems } from './get-all-items'
import { buildFilterMetadata } from './server/filter-metadata'

export async function getAllData({ gallery, query, mapBounds }: GalleryParams & {
  query?: string
  mapBounds?: Bounds | null
}): Promise<All.ItemData> {
  const data = await getAllItems(gallery, allPageItemMapper, true)
  const totalItemCount = mapBounds
    ? filterItemsByMapBounds(data.items, true, mapBounds).length
    : data.items.length

  if (!query) {
    return {
      ...data,
      totalItemCount,
    }
  }

  const baseMetadata = buildFilterMetadata(data.items)
  const scopedItems = filterItemsByQuery(data.items, parseFilterQuery(query, getFilterQueryContext(baseMetadata)))

  const { indexedKeywords, personOptions, tagOptions } = buildFilterMetadata(scopedItems)
  return {
    gallery,
    items: scopedItems,
    indexedKeywords,
    personOptions,
    tagOptions,
    totalItemCount,
  }
}
