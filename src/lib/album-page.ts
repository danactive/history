import getAlbum from './album'
import { filterItemsByQuery, getFilterQueryContext, parseFilterQuery } from './filter-query'
import { buildFilterMetadata } from './server/filter-metadata'
import { addGeographyToSearch } from './search'
import type { AlbumRouteParams } from './server/page-route'
import type { Album } from '../types/pages'

export async function getAlbumData(
  { album, gallery, query }: AlbumRouteParams & { query?: string },
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

  const { indexedKeywords, personOptions, tagOptions } = buildFilterMetadata(scopedItems)

  return {
    gallery,
    album,
    items: scopedItems,
    totalItemCount: query ? preparedItems.length : undefined,
    meta,
    indexedKeywords,
    personOptions,
    tagOptions,
  }
}
