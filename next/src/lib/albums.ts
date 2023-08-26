import camelCase from 'camelcase'
import fsCallback from 'node:fs'
import { promisify } from 'node:util'
import xml2js from 'xml2js'

import utilsFactory from './utils'

type ErrorOptionalMessage = { albums: object[]; error?: { message: string } }
const errorSchema = (message: string = null): ErrorOptionalMessage => {
  const out = { albums: [] }
  if (!message) return out
  return { ...out, error: { message } }
}

const fs = fsCallback.promises
const parseOptions = { explicitArray: false, normalizeTags: true, tagNameProcessors: [(name) => camelCase(name)] }
const parser = new xml2js.Parser(parseOptions)
const parseXml = promisify(parser.parseString)
const utils = utilsFactory()

/**
 * Get Gallery from local filesystem
 * @param {string} gallery name of gallery
 * @returns {string} album as JSON
 */
async function getGalleryFromFilesystem(gallery) {
  const fileBuffer = await fs.readFile(`../public/galleries/${gallery}/gallery.xml`)
  return parseXml(fileBuffer)
}

type Album = {
  name: string;
  h1: string;
  h2: string;
  version: string;
  thumbPath: string;
  year: string;
  search: string;
}

type Albums = {
  albums: Album[]
}

type AlbumBody = {
  body: Albums; status: number;
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
function transformJsonSchema(dirty = { gallery: { album: null } }, gallery = 'demo'): Albums {
  const transform = (album) => ({
    name: album.albumName,
    h1: album.albumH1,
    h2: album.albumH2,
    version: album.albumVersion,
    thumbPath: utils.thumbPath({ filename: album.filename }, gallery),
    year: album.year,
    search: album.search || null,
  })

  if (Array.isArray(dirty.gallery.album)) {
    return { albums: dirty.gallery.album.map(transform) }
  }
  return { albums: [transform(dirty.gallery.album)] }
}

async function get<T extends boolean = false>(gallery: string, returnEnvelope?: T): Promise<T extends true ? AlbumBody : Albums>;

/**
 * Get Albums from local filesystem
 * @param {string} gallery name of gallery
 * @param {boolean} returnEnvelope will enable a return value with HTTP status code and body
 * @returns {Object} albums containing array of album with keys name, h1, h2, version, thumbPath, year
 */
async function get(gallery: string, returnEnvelope = false): Promise<Albums | ErrorOptionalMessage | AlbumBody | ErrorOptionalMessageBody> {
  try {
    const galleryRaw = await getGalleryFromFilesystem(gallery)
    const body = transformJsonSchema(galleryRaw, gallery)

    if (returnEnvelope) {
      return { body, status: 200 }
    }

    return body
  } catch (e) {
    if (returnEnvelope) {
      return { body: errorSchema('No albums are found'), status: 404 }
    }

    return errorSchema()
  }
}

export {
  type Album,
  errorSchema,
  getGalleryFromFilesystem,
  transformJsonSchema,
}

export default get
