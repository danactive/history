import getAlbum from '../lib/album'
import getAlbums from '../lib/albums'
import getGalleries from '../lib/galleries'
import indexKeywords, { addGeographyToSearch } from '../lib/search'
import config from '../models/config'
import type { AlbumMeta, Gallery, Item, ServerSideAllItem } from '../types/common'
import type { All } from '../types/pages'

type PrepareItemsParams = {
  albumName: AlbumMeta['albumName']
  albumCoordinateAccuracy: NonNullable<AlbumMeta['geo']>['zoom']
  items: Item[]
  gallery: Gallery
}

type ItemMapper = (params: PrepareItemsParams) => ServerSideAllItem[]

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

  const allItems = (await albums.reduce(async (prevP, album) => {
    const prev = await prevP
    const { album: { items, meta } } = await getAlbum(gallery, album.name)
    const albumCoordinateAccuracy = meta?.geo?.zoom ?? config.defaultZoom
    const preparedItems = itemMapper({
      albumName: album.name,
      albumCoordinateAccuracy,
      items,
      gallery,
    })
    const itemsToConcat = reverseAlbumItems ? preparedItems.reverse() : preparedItems
    return prev.concat(itemsToConcat)
  }, Promise.resolve([] as ServerSideAllItem[]))).reverse()

  const { indexedKeywords } = indexKeywords(allItems)

  return { items: allItems, indexedKeywords }
}

/**
 * Item mapper for /all page - creates detailed items with all fields
 */
export function allPageItemMapper({ albumName, albumCoordinateAccuracy, items, gallery }: PrepareItemsParams): ServerSideAllItem[] {
  return items.map((item) => {
    const filenameStr = Array.isArray(item.filename) ? (item.filename[0] ?? '') : (item.filename ?? '')
    const titleStr = Array.isArray(item.title) ? (item.title[0] ?? '') : (item.title ?? '')
    const searchStr = addGeographyToSearch(item) ?? ''
    const corpus = [
      item.description ?? '',
      item.caption ?? '',
      item.location ?? '',
      item.city ?? '',
      searchStr,
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
      reference: null,
      videoPaths: null,
      gallery,
      album: albumName,
      title: titleStr,
      corpus,
      search: searchStr,
    }
  })
}

/**
 * Item mapper for /persons page - uses spread operator for simpler mapping
 */
export function personsPageItemMapper({ albumName, albumCoordinateAccuracy, items, gallery }: PrepareItemsParams): ServerSideAllItem[] {
  return items.map((item) => ({
    ...item,
    gallery,
    album: albumName,
    corpus: [item.description, item.caption, item.location, item.city, item.search].join(' '),
    coordinateAccuracy: item.coordinateAccuracy ?? albumCoordinateAccuracy,
    search: addGeographyToSearch(item),
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
