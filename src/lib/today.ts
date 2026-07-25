import getAlbum from './album'
import getAlbums from './albums'
import { filterItemsByVisitedPlaceFromCities, formatVisitedPlace } from './domains/visited'
import { addYearToSearch, getItemYearFromFilename } from './domains/years'
import { buildFilterMetadata, type ServerPageFilterMetadata } from './server/filter-metadata'
import { addGeographyToSearch } from './search'
import config from '../models/config'
import type { AlbumMeta, Gallery, Item, ServerSideTodayItem, VisitedPlace } from '../types/common'
import type { Today } from '../types/pages'
import { compareNewestFirst } from '../utils'

type TodayItemsResult = Today.ItemData & ServerPageFilterMetadata

export async function getTodayItems(gallery: Gallery, monthDay: string, visitedPlace?: VisitedPlace | null): Promise<TodayItemsResult> {
  const { [gallery]: { albums } } = await getAlbums(gallery)

  const prepareItems = (
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

  const items: ServerSideTodayItem[] = []

  for (const album of albums) {
    const { album: { items: albumItems, meta } } = await getAlbum(gallery, album.name)
    const itemsMatchDate = albumItems.filter((item) => item?.filename?.toString().substring?.(5, 10) === monthDay)
    const albumCoordinateAccuracy = meta?.geo?.zoom ?? config.defaultZoom
    const preparedItems = prepareItems({
      albumName: album.name,
      albumCoordinateAccuracy,
      items: itemsMatchDate,
    })
    items.push(...preparedItems.reverse())
  }

  items.sort(compareNewestFirst)

  const totalItemCount = items.length
  const scopedItems = visitedPlace
    ? filterItemsByVisitedPlaceFromCities(items, visitedPlace)
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
    totalItemCount: visitedPlace ? totalItemCount : undefined,
    visitedPlace: visitedPlace ?? null,
    visitedFilterLabel: visitedPlace ? formatVisitedPlace(visitedPlace) : null,
  }
}
