import camelCase from 'camelcase'
import fs from 'node:fs/promises'
import { constants } from 'node:fs'
import { basename, dirname, join } from 'node:path'
import { randomUUID } from 'node:crypto'
import xml2js, { type ParserOptions } from 'xml2js'

import type {
  AlbumName, Gallery, RawXmlAlbum, XmlAlbum, XmlGallery, XmlPersons,
} from '../types/common'
import { generatedGallerySchema } from '../types/generated'
import { digest } from './curation/files'
import { acquireLock } from './curation/lock'

const parseOptions: ParserOptions = { explicitArray: false, normalizeTags: true, tagNameProcessors: [(name) => camelCase(name)] }
const parser = new xml2js.Parser(parseOptions)

const rawParseOptions: ParserOptions = { explicitArray: false }
const rawParser = new xml2js.Parser(rawParseOptions)

export class InvalidAlbumXmlError extends Error {}
export class AlbumRevisionConflict extends Error {}

export async function readAlbumVersion(gallery: Gallery, album: AlbumName) {
  const xml = await fs.readFile(albumFilePath(gallery, album), 'utf8')
  return { data: await new xml2js.Parser(rawParseOptions).parseStringPromise(xml) as RawXmlAlbum, revision: digest(xml) }
}

function albumFilePath(gallery: Gallery, album: AlbumName) {
  const validGallery = generatedGallerySchema.safeParse(gallery)
  if (!validGallery.success) {
    throw new InvalidAlbumXmlError('Gallery is not valid')
  }

  if (!/^[A-Za-z0-9_-]+$/.test(album) || album !== basename(album)) {
    throw new InvalidAlbumXmlError('Album name is not valid')
  }

  return join('public', 'galleries', validGallery.data, `${album}.xml`)
}

async function parseAlbumXml(xml: string) {
  try {
    const parsed = await rawParser.parseStringPromise(xml)
    if (!parsed || typeof parsed !== 'object' || !Object.hasOwn(parsed, 'album')) {
      throw new InvalidAlbumXmlError('XML must have an album root element')
    }
  } catch (error) {
    if (error instanceof InvalidAlbumXmlError) throw error
    throw new InvalidAlbumXmlError('XML must be well formed')
  }
}

async function readAlbum(gallery: Gallery, album: AlbumName): Promise<XmlAlbum>
async function readAlbum(gallery: Gallery, album: AlbumName, options: ParserOptions): Promise<RawXmlAlbum>
async function readAlbum(gallery: Gallery, album: AlbumName, options?: ParserOptions): Promise<XmlAlbum | RawXmlAlbum> {
  const fileBuffer = await fs.readFile(albumFilePath(gallery, album))
  const selectedParser = options === rawParseOptions ? rawParser : (options ? new xml2js.Parser(options) : parser)
  return selectedParser.parseStringPromise(fileBuffer)
}

async function writeAlbum(gallery: Gallery, album: AlbumName, xml: string, expectedRevision?: string) {
  const destinationPath = albumFilePath(gallery, album)
  await parseAlbumXml(xml)
  await fs.access(destinationPath, constants.F_OK)

  const release = await acquireLock(join('.history', 'xml-locks', `${gallery}-${album}.lock`))
  if (!release) throw new AlbumRevisionConflict('Album is being saved. Retry after reviewing current metadata.')
  const temporaryPath = join(dirname(destinationPath), `.${basename(destinationPath)}.${randomUUID()}.tmp`)
  try {
    await fs.writeFile(temporaryPath, xml, 'utf8')
    if (expectedRevision && digest(await fs.readFile(destinationPath, 'utf8')) !== expectedRevision) {
      throw new AlbumRevisionConflict('Album changed since it was loaded. Reload and review your edits before saving.')
    }
    await fs.rename(temporaryPath, destinationPath)
  } catch (error) {
    await fs.rm(temporaryPath, { force: true })
    throw error
  } finally {
    await release()
  }
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
  albumFilePath,
  rawParseOptions,
  readAlbum,
  readGallery,
  readPersons,
  writeAlbum,
}
