import type { Album } from '../types/pages'
import { getInitialActiveFacetCounts } from './active-facets'
import getAlbum from './album'
import { filterItemsByQuery, getFilterQueryContext, parseFilterQuery } from './filter-query'
import { filterItemsByMapBounds, type Bounds } from './map-filtering'
import { addGeographyToSearch } from './search'
import { buildFilterMetadata } from './server/filter-metadata'
import type { AlbumRouteParams } from './server/page-route'

export async function getAlbumData(
  { album, gallery, query, mapBounds }: AlbumRouteParams & { query?: string, mapBounds?: Bounds | null },
): Promise<Album.ItemData> {
  const { album: { items, meta } } = await getAlbum(gallery, album)
  const preparedItems = items.map((item) => ({
    ...item,
    search: addGeographyToSearch(item),
    corpus: [item.description, item.caption, item.location, item.city, item.search].join(' '),
  }))
  const baseMetadata = buildFilterMetadata(preparedItems)
  const scopedItems = query
    ? filterItemsByQuery(preparedItems, parseFilterQuery(query, getFilterQueryContext(baseMetadata)))
    : preparedItems
  const totalItemCount = mapBounds
    ? filterItemsByMapBounds(preparedItems, true, mapBounds).length
    : query
      ? preparedItems.length
      : undefined
  const activeFacetCounts = getInitialActiveFacetCounts({
    items: mapBounds ? filterItemsByMapBounds(preparedItems, true, mapBounds) : preparedItems,
    query,
    context: getFilterQueryContext(baseMetadata),
  })

  const { indexedKeywords, personOptions, tagOptions } = buildFilterMetadata(scopedItems)

  return {
    gallery,
    album,
    items: scopedItems,
    totalItemCount,
    meta,
    indexedKeywords,
    personOptions,
    tagOptions,
    activeFacetCounts,
  }
}
