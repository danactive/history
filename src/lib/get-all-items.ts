import getAlbum from '../lib/album'
import getAlbums from '../lib/albums'
import getGalleries from '../lib/galleries'
import indexKeywords, { addGeographyToSearch, addYearToSearch, getItemYearFromFilename } from '../lib/search'
import { buildVisitedRegionCountryIndex, getVisitedPlace } from '../lib/visited'
import config from '../models/config'
import type { AlbumMeta, Gallery, Item, ServerSideAllItem } from '../types/common'
import { getPrimaryFilename } from '../utils'
import type { VisitedRegionCountryIndex } from './visited'
import type { All } from '../types/pages'

type PrepareItemsParams = {
  albumName: AlbumMeta['albumName']
  albumCoordinateAccuracy: NonNullable<AlbumMeta['geo']>['zoom']
  items: Item[]
  gallery: Gallery
  regionCountryIndex: VisitedRegionCountryIndex
}

type ItemMapper = (params: PrepareItemsParams) => ServerSideAllItem[]

type LoadedAlbumItems = Omit<PrepareItemsParams, 'regionCountryIndex'>

/**
 * Shared utility to get all items from albums with indexed keywords
 * @param {Gallery} gallery Gallery name
 * @param {ItemMapper} itemMapper Custom function to map items to ServerSideAllItem format
 * @param {boolean} reverseAlbumItems Whether to reverse items within each album
 * @returns {Promise<All.ItemData>} Items and indexed keywords
 */
export async function getAllItems(
  gallery: Gallery,
  itemMapper: ItemMapper,
  reverseAlbumItems = false,
): Promise<All.ItemData> {
  const { [gallery]: { albums } } = await getAlbums(gallery)

  const loadedAlbums = await Promise.all(albums.map(async (album): Promise<LoadedAlbumItems> => {
    const { album: { items, meta } } = await getAlbum(gallery, album.name)
    return {
      albumName: album.name,
      albumCoordinateAccuracy: meta?.geo?.zoom ?? config.defaultZoom,
      items,
      gallery,
    }
  }))

  const regionCountryIndex = buildVisitedRegionCountryIndex(loadedAlbums.flatMap(({ items }) => items))

  const allItems = loadedAlbums.flatMap((loadedAlbum) => {
    const preparedItems = itemMapper({
      ...loadedAlbum,
      regionCountryIndex,
    })
    const itemsToConcat = reverseAlbumItems ? preparedItems.reverse() : preparedItems
    return itemsToConcat
  }).reverse()

  const { indexedKeywords } = indexKeywords(allItems)

  return { items: allItems, indexedKeywords }
}

/**
 * Item mapper for /all page - creates detailed items with all fields
 */
export function allPageItemMapper({
  albumName, albumCoordinateAccuracy, items, gallery, regionCountryIndex,
}: PrepareItemsParams): ServerSideAllItem[] {
  return items.map((item) => {
    const filenameStr = getPrimaryFilename(item.filename)
    const titleStr = Array.isArray(item.title) ? (item.title[0] ?? '') : (item.title ?? '')
    const searchStr = addYearToSearch(addGeographyToSearch(item) ?? '', item)
    const year = getItemYearFromFilename(item)
    const corpus = [
      item.description ?? '',
      item.caption ?? '',
      item.location ?? '',
      item.city ?? '',
      searchStr,
      year,
    ].join(' ').trim()

    return {
      id: item.id,
      filename: filenameStr,
      photoDate: item.photoDate,
      city: item.city,
      location: item.location,
      description: item.description,
      caption: item.caption,
      persons: item.persons,
      coordinates: item.coordinates,
      coordinateAccuracy: item.coordinateAccuracy ?? albumCoordinateAccuracy,
      thumbPath: item.thumbPath,
      photoPath: item.photoPath,
      mediaPath: item.mediaPath,
      reference: item.reference,
      videoPaths: null,
      gallery,
      album: albumName,
      title: titleStr,
      corpus,
      search: searchStr,
      visitedPlace: getVisitedPlace(item, regionCountryIndex),
    }
  })
}

/**
 * Item mapper for /persons page - uses spread operator for simpler mapping
 */
export function personsPageItemMapper({
  albumName, albumCoordinateAccuracy, items, gallery, regionCountryIndex,
}: PrepareItemsParams): ServerSideAllItem[] {
  return items.map((item) => ({
    ...item,
    gallery,
    album: albumName,
    corpus: [item.description, item.caption, item.location, item.city, item.search].join(' '),
    coordinateAccuracy: item.coordinateAccuracy ?? albumCoordinateAccuracy,
    search: addGeographyToSearch(item),
    visitedPlace: getVisitedPlace(item, regionCountryIndex),
  }))
}

/**
 * Get all keywords from all galleries and albums
 * @returns {Promise<{ indexedKeywords: ReturnType<typeof indexKeywords>['indexedKeywords'] }>} Indexed keywords with counts
 */
export async function getAllKeywords(): Promise<{ indexedKeywords: ReturnType<typeof indexKeywords>['indexedKeywords'] }> {
  const { galleries } = await getGalleries()
  const allItems: { search: Item['search'] }[] = []

  // Collect search keywords from all galleries
  for (const gallery of galleries) {
    const { [gallery]: { albums } } = await getAlbums(gallery)

    for (const album of albums) {
      try {
        const { album: { items } } = await getAlbum(gallery, album.name)
        items.forEach((item) => {
          if (item.search) {
            allItems.push({ search: item.search })
          }
        })
      } catch (error) {
        console.error(`Failed to read album ${album.name} in gallery ${gallery}:`, error)
      }
    }
  }

  const { indexedKeywords } = indexKeywords(allItems)
  return { indexedKeywords }
}
