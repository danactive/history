import getAlbum from '../lib/album'
import getAlbums from '../lib/albums'
import indexKeywords, { addGeographyToSearch } from '../lib/search'
import config from '../models/config'
import type { AlbumMeta, Item, ServerSideAllItem } from '../types/common'
import type { All } from '../types/pages'

export async function getAllData({ gallery }: All.Params): Promise<All.ItemData> {
  const { [gallery]: { albums } } = await getAlbums(gallery)

  const prepareItems = (
    { albumName, albumCoordinateAccuracy, items }:
    { albumName: AlbumMeta['albumName']; albumCoordinateAccuracy: NonNullable<AlbumMeta['geo']>['zoom']; items: Item[] },
  ) => items.map((item) => {
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
      caption: item.caption,
      persons: item.persons,
      coordinates: item.coordinates,
      coordinateAccuracy: item.coordinateAccuracy ?? albumCoordinateAccuracy,
      thumbPath: item.thumbPath,
      photoPath: item.photoPath,
      mediaPath: item.mediaPath,
      description: null,
      reference: null,
      videoPaths: null,
      gallery,
      album: albumName,
      title: titleStr,
      corpus,
      search: searchStr,
    }
  })

  const allItems = (await albums.reduce(async (prevP, album) => {
    const prev = await prevP
    const { album: { items, meta } } = await getAlbum(gallery, album.name)
    const albumCoordinateAccuracy = meta?.geo?.zoom ?? config.defaultZoom
    const preparedItems = prepareItems({ albumName: album.name, albumCoordinateAccuracy, items })
    return prev.concat(preparedItems.reverse())
  }, Promise.resolve([] as ServerSideAllItem[]))).reverse()

  // indexKeywords will run on slim items; keep keyword index small too
  const { indexedKeywords } = indexKeywords(allItems)

  return { items: allItems, indexedKeywords }
}
