import { cacheLife, cacheTag } from 'next/cache'
import getAlbum from '../lib/album'
import getAlbums from '../lib/albums'
import { addYearToSearch, getItemYearFromFilename } from '../lib/domains/years'
import getGalleries from '../lib/galleries'
import { addGeographyToSearch } from '../lib/search'
import { buildVisitedRegionCountryIndex, getVisitedPlace } from '../lib/visited'
import config from '../models/config'
import type { AlbumMeta, Gallery, Item, ServerSideAllItem } from '../types/common'
import type { All } from '../types/pages'
import { compareAlbumYearNewestFirst, compareItemOldestFirst } from '../utils'
import { buildFilterMetadata } from './server/filter-metadata'
import type { VisitedRegionCountryIndex } from './visited'

type PrepareItemsParams = {
  albumName: AlbumMeta['albumName']
  albumCoordinateAccuracy: NonNullable<AlbumMeta['geo']>['zoom']
  items: Item[]
  gallery: Gallery
  regionCountryIndex: VisitedRegionCountryIndex
}

type ItemMapper = (params: PrepareItemsParams) => ServerSideAllItem[]

export type LoadedAlbumItems = Omit<PrepareItemsParams, 'regionCountryIndex'> & {
  year: string;
}

export function getGalleryItemsCacheTag(gallery: Gallery) {
  return `gallery-items:${gallery}`
}

export function applyGalleryItemsCachePolicy(gallery: Gallery) {
  try {
    cacheLife('max')
    cacheTag(getGalleryItemsCacheTag(gallery))
  } catch (error) {
    if (error instanceof Error && error.message.includes('only available with the `cacheComponents` config')) {
      return
    }
    throw error
  }
}

export async function getOrderedAlbumItems(gallery: Gallery): Promise<LoadedAlbumItems[]> {
  'use cache'

  applyGalleryItemsCachePolicy(gallery)

  const { [gallery]: { albums } } = await getAlbums(gallery)
  const loadedAlbums = await Promise.all(albums.map(async (album): Promise<LoadedAlbumItems> => {
    const { album: { items, meta } } = await getAlbum(gallery, album.name)
    return {
      albumName: album.name,
      albumCoordinateAccuracy: meta?.geo?.zoom ?? config.defaultZoom,
      year: album.year,
      items,
      gallery,
    }
  }))

  return loadedAlbums.sort(compareAlbumYearNewestFirst)
}

/**
 * Shared utility to get all items from albums with indexed keywords
 * @param {Gallery} gallery Gallery name
 * @param {ItemMapper} itemMapper Custom function to map items to ServerSideAllItem format
 * @returns {Promise<All.ItemData>} Items and indexed keywords
 */
export async function getAllItems(
  gallery: Gallery,
  itemMapper: ItemMapper,
): Promise<All.ItemData> {
  const loadedAlbums = await getOrderedAlbumItems(gallery)

  const regionCountryIndex = buildVisitedRegionCountryIndex(loadedAlbums.flatMap(({ items }) => items))

  const allItems = loadedAlbums.flatMap((loadedAlbum) => {
    const preparedItems = itemMapper({
      ...loadedAlbum,
      regionCountryIndex,
    })
    return preparedItems.sort(compareItemOldestFirst)
  })

  const { indexedKeywords, personOptions, tagOptions } = buildFilterMetadata(allItems)

  return { gallery, items: allItems, indexedKeywords, personOptions, tagOptions }
}

export async function getAllPageItems(gallery: Gallery): Promise<All.ItemData> {
  'use cache'

  applyGalleryItemsCachePolicy(gallery)
  return getAllItems(gallery, allPageItemMapper)
}

export async function getPersonsPageItems(gallery: Gallery): Promise<All.ItemData> {
  'use cache'

  applyGalleryItemsCachePolicy(gallery)
  return getAllItems(gallery, personsPageItemMapper)
}

/**
 * Item mapper for /all page - creates detailed items with all fields
 */
export function allPageItemMapper({
  albumName, albumCoordinateAccuracy, items, gallery, regionCountryIndex,
}: PrepareItemsParams): ServerSideAllItem[] {
  return items.map((item) => {
    const searchStr = addYearToSearch(addGeographyToSearch(item), item)
    const year = getItemYearFromFilename(item)
    const corpus = [
      item.description ?? '',
      item.caption,
      item.location ?? '',
      item.city,
      searchStr,
      year,
    ].join(' ').trim()

    return {
      ...item,
      gallery,
      album: albumName,
      coordinateAccuracy: item.coordinateAccuracy ?? albumCoordinateAccuracy,
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
export async function getAllKeywords(): Promise<{ indexedKeywords: All.ItemData['indexedKeywords'] }> {
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

  const { indexedKeywords } = buildFilterMetadata(allItems)
  return { indexedKeywords }
}
