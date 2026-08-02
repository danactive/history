import type { All } from '../types/pages'
import type { GalleryParams } from './server/page-route'
import { filterItemsByQuery, getFilterQueryContext, parseFilterQuery } from './filter-query'
import { allPageItemMapper, getAllItems } from './get-all-items'
import { buildFilterMetadata } from './server/filter-metadata'

export async function getAllData({ gallery, query }: GalleryParams & {
  query?: string
}): Promise<All.ItemData> {
  const data = await getAllItems(gallery, allPageItemMapper, true)

  if (!query) {
    return {
      ...data,
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
    totalItemCount: data.items.length,
  }
}
