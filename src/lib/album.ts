import transformAlbumSchema, { errorSchema, type ErrorOptionalMessage } from '../models/album'
import type { Album, AlbumMeta, XmlAlbum } from '../types/common'
import { handleLibraryError } from './errors'
import getGalleries from './galleries'
import getPersons from './persons'
import { readAlbum } from './xml'

type Envelope = { body: Album, status: number }
type ErrorOptionalMessageBody = {
  body: ErrorOptionalMessage; status: number;
}
type ReturnAlbumOrErrors = Promise<Envelope | Album | ErrorOptionalMessage | ErrorOptionalMessageBody>
async function get<T extends boolean = false>(
  gallery: AlbumMeta['gallery'] | AlbumMeta['gallery'][],
  album: AlbumMeta['albumName'] | AlbumMeta['albumName'][],
  returnEnvelope?: T,
): Promise<T extends true ? Envelope : Album>
/**
 * Get Album XML from local filesystem
 * @param {string} gallery name of gallery
 * @param {string} album name of album
 * @param {boolean} returnEnvelope will enable a return value with HTTP status code and body
 * @returns {object} album containing meta and items with keys filename, photoCity, photoLoc, thumbCaption, photoDesc
 */
async function get(
  gallery: AlbumMeta['gallery'] | AlbumMeta['gallery'][],
  album: AlbumMeta['albumName'] | AlbumMeta['albumName'][],
  returnEnvelope: boolean,
): ReturnAlbumOrErrors {
  let xmlAlbum: XmlAlbum

  try {
    if (gallery === null || gallery === undefined || Array.isArray(gallery)) {
      throw new ReferenceError('Gallery name is missing')
    }
    if (!album === null || album === undefined || Array.isArray(album)) {
      throw new ReferenceError('Album name is missing')
    }
    const { galleries } = await getGalleries(false)
    if (!galleries.includes(gallery)) {
      throw new ReferenceError(`Gallery name (${gallery}) is not expected`)
    }
    xmlAlbum = await readAlbum(gallery, album)
  } catch (err) {
    const message = `No album was found; gallery=${gallery}; album=${album};`
    return handleLibraryError(err, message, returnEnvelope, errorSchema)
  }

  const body = transformAlbumSchema(xmlAlbum, await getPersons(gallery))

  if (returnEnvelope) {
    return { body, status: 200 }
  }

  return body
}

export {
  transformAlbumSchema as transformJsonSchema,
  type Envelope as AlbumResponse,
  type Album as AlbumResponseBody,
}
export default get
