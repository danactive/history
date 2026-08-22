import { filterItemsByQuery, getFilterQueryContext, parseFilterQuery } from './filter-query'
import { filterItemsByMapBounds, type Bounds } from './map-filtering'
import { addYearToSearch, getItemYearFromFilename } from './domains/years'
import { buildFilterMetadata, type ServerPageFilterMetadata } from './server/filter-metadata'
import { addGeographyToSearch } from './search'
import type { AlbumMeta, Gallery, Item, ServerSideTodayItem } from '../types/common'
import type { Today } from '../types/pages'
import { compareItemOldestFirst } from '../utils'
import { getInitialActiveFacetCounts } from './active-facets'
import { resolvePhotoDate } from '../utils/person-age'
import { applyGalleryItemsCachePolicy, getOrderedAlbumItems } from './get-all-items'

type TodayItemsResult = Today.ItemData & ServerPageFilterMetadata

export function getItemMonthDay(item: Item) {
  return resolvePhotoDate(item).substring(5, 10)
}

const prepareTodayItems = (
  { albumName, albumCoordinateAccuracy, items }:
  {
    albumName: AlbumMeta['albumName'],
    albumCoordinateAccuracy: NonNullable<AlbumMeta['geo']>['zoom'],
    items: Item[],
  },
) => items.map((item) => {
  const year = getItemYearFromFilename(item)
  const search = addYearToSearch(addGeographyToSearch(item), item)
  return {
    ...item,
    album: albumName,
    corpus: [item.description, item.caption, item.location, item.city, search, year]
      .join(' ')
      .trim(),
    coordinateAccuracy: item.coordinateAccuracy ?? albumCoordinateAccuracy,
    search,
  }
})

export async function getTodayPageItems(gallery: Gallery, monthDay: string): Promise<ServerSideTodayItem[]> {
  'use cache'

  applyGalleryItemsCachePolicy(gallery)

  const albums = await getOrderedAlbumItems(gallery)
  return albums.flatMap(({ albumCoordinateAccuracy, albumName, items }) => {
    const itemsMatchDate = items.filter((item) => getItemMonthDay(item) === monthDay)
    return prepareTodayItems({
      albumName,
      albumCoordinateAccuracy,
      items: itemsMatchDate,
    }).sort(compareItemOldestFirst)
  })
}

export async function getTodayItems(
  gallery: Gallery,
  monthDay: string,
  query?: string,
  mapBounds?: Bounds | null,
): Promise<TodayItemsResult> {
  const items = await getTodayPageItems(gallery, monthDay)

  const totalItemCount = mapBounds
    ? filterItemsByMapBounds(items, true, mapBounds).length
    : items.length
  const baseMetadata = buildFilterMetadata(items)
  const activeFacetCounts = getInitialActiveFacetCounts({
    items: mapBounds ? filterItemsByMapBounds(items, true, mapBounds) : items,
    query,
    context: getFilterQueryContext(baseMetadata),
  })
  const hasQuery = Boolean(query)
  const parsedQuery = query ? parseFilterQuery(query, getFilterQueryContext(baseMetadata)) : null
  const scopedItems = parsedQuery
    ? filterItemsByQuery(items, parsedQuery)
    : items

  const { indexedKeywords, locationOptions, personCounts, personOptions, yearOptions, tagOptions } = buildFilterMetadata(scopedItems)

  return {
    items: scopedItems,
    indexedKeywords,
    locationOptions,
    personCounts,
    personOptions,
    yearOptions,
    tagOptions,
    totalItemCount: hasQuery || mapBounds ? totalItemCount : undefined,
    activeFacetCounts,
  }
}
