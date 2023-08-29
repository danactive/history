import camelCase from 'camelcase'
import fs from 'node:fs/promises'
import xml2js, { type ParserOptions } from 'xml2js'

import utilsFactory from './utils'
import type { GalleryAlbum, XmlGallery, XmlGalleryAlbum } from '../types/common'

type ErrorOptionalMessage = { albums: object[]; error?: { message: string } }
const errorSchema = (message: string): ErrorOptionalMessage => {
  const out = { albums: [] }
  if (!message) return out
  return { ...out, error: { message } }
}

const parseOptions: ParserOptions = { explicitArray: false, normalizeTags: true, tagNameProcessors: [(name) => camelCase(name)] }
const parser = new xml2js.Parser(parseOptions)
const utils = utilsFactory()

/**
 * Get Gallery from local filesystem
 * @param {string} gallery name of gallery
 * @returns {string} album as JSON
 */
async function getGalleryFromFilesystem(gallery: string): Promise<XmlGallery> {
  const fileBuffer = await fs.readFile(`../public/galleries/${gallery}/gallery.xml`)
  return parser.parseStringPromise(fileBuffer)
}

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

async function get<T extends boolean = false>(gallery: string, returnEnvelope?: T): Promise<T extends true ? GalleryAlbumBody : GalleryAlbums>;

/**
 * Get Albums from local filesystem
 * @param {string} gallery name of gallery
 * @param {boolean} returnEnvelope will enable a return value with HTTP status code and body
 * @returns {Object} albums containing array of album with keys name, h1, h2, version, thumbPath, year
 */
async function get(gallery: string, returnEnvelope = false): Promise<
  GalleryAlbums
  | ErrorOptionalMessage
  | GalleryAlbumBody
  | ErrorOptionalMessageBody
> {
  try {
    const galleryRaw = await getGalleryFromFilesystem(gallery)
    const body = transformJsonSchema(galleryRaw, gallery)

    if (returnEnvelope) {
      return { body, status: 200 }
    }

    return body
  } catch (e) {
    const message = `No albums was found; gallery=${gallery};`
    if (returnEnvelope) {
      return { body: errorSchema(message), status: 404 }
    }

    // eslint-disable-next-line no-console
    console.error('ERROR', message, e)
    throw e
  }
}

export {
  errorSchema,
  getGalleryFromFilesystem,
  transformJsonSchema,
}
export default get
