import getAlbum from './album'
import { filterItemsByVisitedPlaceFromCities, formatVisitedPlace } from './domains/visited'
import { buildFilterMetadata } from './server/filter-metadata'
import { addGeographyToSearch } from './search'
import type { VisitedPlace } from '../types/common'
import type { Album } from '../types/pages'

export async function getAlbumData({ album, gallery, visitedPlace }: Album.Params & { visitedPlace?: VisitedPlace | null }): Promise<Album.ItemData> {
  const { album: { items, meta } } = await getAlbum(gallery, album)
  const preparedItems = items.map((item) => ({
    ...item,
    search: addGeographyToSearch(item),
    corpus: [item.description, item.caption, item.location, item.city, item.search].join(' '),
  }))
  const scopedItems = visitedPlace
    ? filterItemsByVisitedPlaceFromCities(preparedItems, visitedPlace)
    : preparedItems

  return {
    gallery,
    album,
    items: scopedItems,
    totalItemCount: visitedPlace ? preparedItems.length : undefined,
    visitedPlace: visitedPlace ?? null,
    visitedFilterLabel: visitedPlace ? formatVisitedPlace(visitedPlace) : null,
    meta,
    indexedKeywords: buildFilterMetadata(scopedItems).indexedKeywords,
  }
}
