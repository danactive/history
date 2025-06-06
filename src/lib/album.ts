import transformAlbumSchema, { errorSchema, type ErrorOptionalMessage } from '../models/album'
import type { Album, AlbumMeta } from '../types/common'
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
    const xmlAlbum = await readAlbum(gallery, album)

    let relativeDate = null
    if (xmlAlbum.album.item) {
      const filenames = Array.isArray(xmlAlbum.album.item) ? xmlAlbum.album.item[0].filename : xmlAlbum.album.item.filename
      const filename = Array.isArray(filenames) ? filenames[0] : filenames
      relativeDate = new Date(filename.substring(0, 10))
    }

    const body = transformAlbumSchema(xmlAlbum, await getPersons(gallery))

    if (returnEnvelope) {
      return { body, status: 200 }
    }

    return body
  } catch (e) {
    const message = `No album was found; gallery=${gallery}; album=${album};`
    if (returnEnvelope) {
      return { body: errorSchema(message), status: 404 }
    }

     
    console.error('ERROR', message, e)
    throw e
  }
}

export { transformAlbumSchema as transformJsonSchema }
export default get
