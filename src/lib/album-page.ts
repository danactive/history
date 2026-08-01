import getAlbum from './album'
import { filterItemsBySelectedPerson } from './filter-selected-person'
import { filterItemsByVisitedPlaceFromCities, formatVisitedPlace } from './domains/visited'
import { buildFilterMetadata } from './server/filter-metadata'
import { addGeographyToSearch } from './search'
import type { VisitedPlace } from '../types/common'
import type { Album } from '../types/pages'

export async function getAlbumData(
  { album, gallery, visitedPlace, selectedPerson }: Album.Params & {
    visitedPlace?: VisitedPlace | null
    selectedPerson?: string | null
  },
): Promise<Album.ItemData> {
  const { album: { items, meta } } = await getAlbum(gallery, album)
  const preparedItems = items.map((item) => ({
    ...item,
    search: addGeographyToSearch(item),
    corpus: [item.description, item.caption, item.location, item.city, item.search].join(' '),
  }))
  const visitedScopedItems = visitedPlace
    ? filterItemsByVisitedPlaceFromCities(preparedItems, visitedPlace)
    : preparedItems
  const scopedItems = filterItemsBySelectedPerson(visitedScopedItems, selectedPerson ?? null)

  const { indexedKeywords, personOptions, tagOptions } = buildFilterMetadata(scopedItems)

  return {
    gallery,
    album,
    items: scopedItems,
    totalItemCount: visitedPlace || selectedPerson ? preparedItems.length : undefined,
    visitedPlace: visitedPlace ?? null,
    visitedFilterLabel: visitedPlace ? formatVisitedPlace(visitedPlace) : null,
    meta,
    indexedKeywords,
    personOptions,
    tagOptions,
  }
}
