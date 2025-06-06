import getGalleries from './galleries'
import utilsFactory from './utils'
import type {
  AlbumMeta,
  GalleryAlbum,
  XmlGallery,
  XmlGalleryAlbum,
} from '../types/common'
import { readGallery } from './xml'

type ErrorOptionalMessage = { albums: object[]; error?: { message: string } }
const errorSchema = (message: string): ErrorOptionalMessage => {
  const out = { albums: [] }
  if (!message) return out
  return { ...out, error: { message } }
}

const utils = utilsFactory()

type GalleryAlbums = {
  albums: GalleryAlbum[]
}

type GalleryAlbumBody = {
  body: GalleryAlbums; status: number;
}

type ErrorOptionalMessageBody = {
  body: ErrorOptionalMessage; status: number;
}

/**
 * Transform dirty JSON from XML into clean JSON schema
 * @param {object} dirty JSON with schema from XML
 * @param {string} gallery name of gallery
 * @returns {object} clean JSON
 */
function transformJsonSchema(dirty: XmlGallery = { gallery: { album: [] } }, gallery = 'demo'): GalleryAlbums {
  const transform = (album: XmlGalleryAlbum) => ({
    name: album.albumName,
    h1: album.albumH1,
    h2: album.albumH2,
    version: album.albumVersion,
    thumbPath: utils.thumbPath(album.filename, gallery),
    year: album.year,
    search: album.search || null,
  })

  if (Array.isArray(dirty.gallery.album)) {
    return { albums: dirty.gallery.album.map(transform) }
  }
  return { albums: [transform(dirty.gallery.album)] }
}

async function get<T extends boolean = false>(
  gallery: AlbumMeta['gallery'] | AlbumMeta['gallery'][] | undefined | null,
  returnEnvelope?: T,
): Promise<T extends true ? GalleryAlbumBody : GalleryAlbums>;

/**
 * Get Albums from local filesystem
 * @param {string} gallery name of gallery
 * @param {boolean} returnEnvelope will enable a return value with HTTP status code and body
 * @returns {Object} albums containing array of album with keys name, h1, h2, version, thumbPath, year
 */
async function get(gallery: AlbumMeta['gallery'] | AlbumMeta['gallery'][] | undefined | null, returnEnvelope = false): Promise<
  GalleryAlbums
  | ErrorOptionalMessage
  | GalleryAlbumBody
  | ErrorOptionalMessageBody
> {
  try {
    if (gallery === null || gallery === undefined || Array.isArray(gallery)) {
      throw new ReferenceError('Gallery name is missing')
    }
    const { galleries } = await getGalleries(false)
    if (!galleries.includes(gallery)) {
      throw new ReferenceError(`Gallery name (${gallery}) is not expected`)
    }
    const xmlGallery = await readGallery(gallery)
    const body = transformJsonSchema(xmlGallery, gallery)

    if (returnEnvelope) {
      return { body, status: 200 }
    }

    return body
  } catch (e) {
    const message = `No albums was found; gallery=${gallery};`
    if (returnEnvelope) {
      return { body: errorSchema(message), status: 404 }
    }

     
    console.error('ERROR', message, e)
    throw e
  }
}

export {
  errorSchema,
  readGallery,
  transformJsonSchema,
}
export default get
