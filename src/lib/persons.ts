import getAlbum from '../lib/album'
import getAlbums from '../lib/albums'
import indexKeywords, { addGeographyToSearch } from '../lib/search'
import config from '../models/config'
import transformJsonSchema, { errorSchema, type ErrorOptionalMessage } from '../models/person'
import type { AlbumMeta, Gallery, Item, Person, ServerSideAllItem } from '../types/common'
import type { All } from '../types/pages'
import { handleLibraryError } from './utils'
import { readPersons } from './xml'

type Envelope = { body: Person[], status: number }
type ErrorOptionalMessageBody = {
  body: ErrorOptionalMessage; status: number;
}
type ReturnAlbumOrErrors = Promise<Envelope | Person[] | ErrorOptionalMessage | ErrorOptionalMessageBody>
async function get<T extends boolean = false>(
  gallery: Gallery,
  returnEnvelope?: T,
): Promise<T extends true ? Envelope : Person[]>
/**
 * Get Persons XML from local filesystem
 * @param {string} gallery name of gallery
 * @param {boolean} returnEnvelope will enable a return value with HTTP status code and body
 * @returns {object} person
 */
async function get(
  gallery: Gallery,
  returnEnvelope: boolean,
): ReturnAlbumOrErrors {
  try {
    if (gallery === null || gallery === undefined) {
      throw new ReferenceError('Gallery name is missing')
    }
    const xmlPerson = await readPersons(gallery)
    const body = transformJsonSchema(xmlPerson)

    if (returnEnvelope) {
      return { body, status: 200 }
    }

    return body
  } catch (err) {
    const message = `No person file was found; gallery=${gallery};`
    return handleLibraryError(err, message, returnEnvelope, errorSchema)
  }
}

export async function getPersonsData({ gallery }: All.Params): Promise<All.ItemData> {
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
    return prev.concat(preparedItems)
  }, Promise.resolve([] as ServerSideAllItem[]))).reverse()

  return {
    items: allItems, ...indexKeywords(allItems),
  }
}

export default get
