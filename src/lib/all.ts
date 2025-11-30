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
    {
      albumName: AlbumMeta['albumName'],
      albumCoordinateAccuracy: NonNullable<AlbumMeta['geo']>['zoom'],
      items: Item[],
    },
  ) => items.map((item) => ({
    ...item,
    gallery,
    album: albumName,
    corpus: [item.description, item.caption, item.location, item.city, item.search].join(' '),
    coordinateAccuracy: item.coordinateAccuracy ?? albumCoordinateAccuracy,
    search: addGeographyToSearch(item),
  }))

  // reverse order for albums in ascending order (oldest on top)
  const allItems = (await albums.reduce(async (previousPromise, album) => {
    const prev = await previousPromise
    const { album: { items, meta } } = await getAlbum(gallery, album.name)
    const albumCoordinateAccuracy = meta?.geo?.zoom ?? config.defaultZoom
    const preparedItems = prepareItems({
      albumName: album.name,
      albumCoordinateAccuracy,
      items,
    })
    return prev.concat(preparedItems.reverse())
  }, Promise.resolve([] as ServerSideAllItem[]))).reverse()

  return {
    items: allItems, ...indexKeywords(allItems),
  }
}
