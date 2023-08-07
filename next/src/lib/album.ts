import camelCase from 'camelcase'

import fsCallback from 'node:fs'
import { promisify } from 'node:util'
import xml2js from 'xml2js'

import transformJsonSchema, { type ErrorOptionalMessage, errorSchema } from '../models/album'
import { Album } from '../types/common'

const fs = fsCallback.promises
const parseOptions = { explicitArray: false, normalizeTags: true, tagNameProcessors: [(name) => camelCase(name)] }
const parser = new xml2js.Parser(parseOptions)
const parseXml = promisify(parser.parseString)

/**
* Get album XML from local filesystem
* @param {string} gallery name of gallery
* @param {string} album name of album
* @returns {string} album XML
*/
async function getXmlFromFilesystem(gallery: string, album: string) {
  const fileBuffer = await fs.readFile(`../public/galleries/${gallery}/${album}.xml`)
  return parseXml(fileBuffer)
}

type Envelope = { body: Album, status: number }
type ErrorOptionalMessageBody = {
  body: ErrorOptionalMessage; status: number;
}
type ReturnAlbumOrErrors = Promise<Envelope | Album | ErrorOptionalMessage | ErrorOptionalMessageBody>
async function get<T extends boolean = false>(gallery: string, album: string, returnEnvelope?: T): Promise<T extends true ? Envelope : Album>
/**
 * Get Album XML from local filesystem
 * @param {string} gallery name of gallery
 * @param {string} album name of album
 * @param {boolean} returnEnvelope will enable a return value with HTTP status code and body
 * @returns {object} album containing meta and items with keys filename, photoCity, photoLoc, thumbCaption, photoDesc
 */
async function get(gallery: string, album: string, returnEnvelope: boolean): ReturnAlbumOrErrors {
  try {
    const xml = await getXmlFromFilesystem(gallery, album)
    const body = transformJsonSchema(xml)

    if (returnEnvelope) {
      return { body, status: 200 }
    }

    return body
  } catch (e) {
    const message = 'No album was found'
    if (returnEnvelope) {
      return { body: errorSchema(message), status: 404 }
    }

    return errorSchema(message)
  }
}

export { transformJsonSchema }
export default get
