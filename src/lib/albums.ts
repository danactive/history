import type {
  AlbumMeta,
  GalleryAlbum,
  XmlGallery,
  XmlGalleryAlbum,
} from '../types/common'
import getGalleries from './galleries'
import utilsFactory, { isValidStringArray } from './utils'
import { readGallery } from './xml'

type ErrorOptionalMessage = { albums: object[]; error?: { message: string } }
const errorSchema = (message: string): ErrorOptionalMessage => {
  const out = { albums: [] }
  if (!message) return out
  return { ...out, error: { message } }
}

const utils = utilsFactory()

type AlbumsBody = {
  albums: GalleryAlbum[]
}

export type GalleryAlbumsBody = Record<NonNullable<AlbumMeta['gallery']>, AlbumsBody>

type AlbumsResponse = {
  body: GalleryAlbumsBody; status: number;
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
function transformJsonSchema(dirty: XmlGallery = { gallery: { album: [] } }, gallery = 'demo'): AlbumsBody {
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

async function get(): Promise<GalleryAlbumsBody>
async function get<T extends boolean = false>(
  galleryOrGalleries: AlbumMeta['gallery'] | AlbumMeta['gallery'][] | undefined | null,
  returnEnvelope?: T,
): Promise<T extends true ? AlbumsResponse : GalleryAlbumsBody>;

/**
 * Get Albums from local filesystem
 * @param {string | string[]} galleryOrGalleries name of gallery
 * @param {boolean} returnEnvelope will enable a return value with HTTP status code and body
 * @returns {object} albums containing array of album with keys name, h1, h2, version, thumbPath, year
 */
async function get(galleryOrGalleries: AlbumMeta['gallery'] | AlbumMeta['gallery'][] | undefined | null = null, returnEnvelope = false): Promise<
  GalleryAlbumsBody
  | ErrorOptionalMessage
  | AlbumsResponse
  | ErrorOptionalMessageBody
> {
  try {
    const { galleries } = await getGalleries(false)
    galleryOrGalleries = galleryOrGalleries ?? galleries

    if (Array.isArray(galleryOrGalleries)) {
      if (!isValidStringArray(galleryOrGalleries)) {
        throw new ReferenceError('All gallery names cannot be nullish')
      }

      const isAllowedGallery = galleryOrGalleries.every(g => galleries.includes(g))
      if (!isAllowedGallery) {
        throw new ReferenceError(`One of the gallery names is not expected: ${galleryOrGalleries}`)
      }

      const out: GalleryAlbumsBody = {}
      for (const gallery of galleries) {
        const xmlGallery = await readGallery(gallery)
        const body = transformJsonSchema(xmlGallery, gallery)
        out[gallery] = body
      }

      if (returnEnvelope) {
        return { body: out, status: 200 }
      }

      return out
    }

    if (typeof galleryOrGalleries !== 'string' || !galleryOrGalleries.trim()) {
      throw new ReferenceError('Gallery must be a non-empty string')
    }

    if (!galleries.includes(galleryOrGalleries)) {
      throw new ReferenceError(`Gallery name (${galleryOrGalleries}) is not expected`)
    }

    const xmlGallery = await readGallery(galleryOrGalleries)
    const body = transformJsonSchema(xmlGallery, galleryOrGalleries)

    if (returnEnvelope) {
      return { body: { [galleryOrGalleries]: body }, status: 200 }
    }

    return { [galleryOrGalleries]: body }
  } catch (e) {
    const message = `No albums was found; gallery=${galleryOrGalleries};`
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
