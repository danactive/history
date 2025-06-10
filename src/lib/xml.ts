import camelCase from 'camelcase'
import fs from 'node:fs/promises'
import xml2js, { type ParserOptions } from 'xml2js'

import type {
  AlbumMeta, Gallery, XmlAlbum, XmlGallery, XmlPersons,
} from '../types/common'

const parseOptions: ParserOptions = { explicitArray: false, normalizeTags: true, tagNameProcessors: [(name) => camelCase(name)] }
const parser = new xml2js.Parser(parseOptions)

/**
* Get Album XML from local filesystem
* @param {string} gallery name of gallery
* @param {string} album name of album
* @returns {string} album XML
*/
async function readAlbum(gallery: NonNullable<AlbumMeta['gallery']>, album: string): Promise<XmlAlbum> {
  const fileBuffer = await fs.readFile(`public/galleries/${gallery}/${album}.xml`)
  return parser.parseStringPromise(fileBuffer)
}

/**
 * Get Gallery XML from local filesystem
 * @param {string} gallery name of gallery
 * @returns {string} album as JSON
 */
async function readGallery(gallery: Gallery): Promise<XmlGallery> {
  const fileBuffer = await fs.readFile(`public/galleries/${gallery}/gallery.xml`)
  return parser.parseStringPromise(fileBuffer)
}

/**
 * Get Persons XML from local filesystem
 * @param {string} gallery name of gallery
 * @returns {string} album as JSON
 */
async function readPersons(gallery: Gallery): Promise<XmlPersons> {
  const fileBuffer = await fs.readFile(`public/galleries/${gallery}/persons.xml`)
  return parser.parseStringPromise(fileBuffer)
}

export {
  readAlbum,
  readGallery,
  readPersons,
}

