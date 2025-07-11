import config from '../models/config'
import type {
  AlbumMeta,
  Gallery,
  GalleryAlbum,
  XmlGallery,
  XmlGalleryAlbum,
} from '../types/common'
import getGalleries from './galleries'
import utilsFactory, { handleLibraryError, isValidStringArray } from './utils'
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

export type GalleryAlbumsBody = Record<Gallery, AlbumsBody>

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
function transformJsonSchema(dirty: XmlGallery = { gallery: { album: [] } }, gallery: Gallery = config.defaultGallery): AlbumsBody {
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

    const inputGalleries = Array.isArray(galleryOrGalleries)
      ? galleryOrGalleries
      : [galleryOrGalleries]

    if (!isValidStringArray<Gallery>(inputGalleries)) {
      throw new ReferenceError('All gallery names must be non-empty strings')
    }

    const isAllowedGallery = inputGalleries.every(g => galleries.includes(g))
    if (!isAllowedGallery) {
      throw new ReferenceError(`One or more gallery names are not expected: ${inputGalleries}`)
    }

    const partialOut: Partial<GalleryAlbumsBody> = {}

    for (const gallery of inputGalleries) {
      const xmlGallery = await readGallery(gallery)
      const body = transformJsonSchema(xmlGallery, gallery)
      partialOut[gallery] = body
    }

    const fullOut = partialOut as GalleryAlbumsBody

    if (returnEnvelope) {
      return { body: fullOut, status: 200 }
    }

    // If only one gallery was requested, return just that slice
    if (!Array.isArray(galleryOrGalleries)) {
      return { [galleryOrGalleries]: fullOut[galleryOrGalleries] } as GalleryAlbumsBody
    }

    return fullOut
  } catch (err) {
    const message = `No albums was found; gallery=${galleryOrGalleries};`
    return handleLibraryError(err, message, returnEnvelope, errorSchema)
  }
}

export {
  errorSchema,
  readGallery,
  transformJsonSchema,
}
export default get
