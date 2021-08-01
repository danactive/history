const camelCase = require('camelcase')
const fsCallback = require('fs')
const xml2js = require('xml2js')
const { promisify } = require('util')

const utilsFactory = require('./utils')

const errorSchema = (message) => {
  const out = { albums: [] }
  if (!message) return out
  return { ...out, error: { message } }
}

const fs = fsCallback.promises
const parseOptions = { explicitArray: false, normalizeTags: true, tagNameProcessors: [(name) => camelCase(name)] }
const parser = new xml2js.Parser(parseOptions)
const parseXml = promisify(parser.parseString)
const utils = utilsFactory(errorSchema)

/**
 * Get Gallery from local filesystem
 * @param {string} gallery name of gallery
 * @returns {string} album as JSON
 */
async function getGalleryFromFilesystem(gallery) {
  const fileBuffer = await fs.readFile(`../public/galleries/${gallery}/gallery.xml`)
  return parseXml(fileBuffer)
}

/**
 * Transform dirty JSON from XML into clean JSON schema
 * @param {object} dirty JSON with schema from XML
 * @param {string} gallery name of gallery
 * @returns {object} clean JSON
 */
const transformJsonSchema = (dirty = {}, gallery) => {
  const transform = (album) => ({
    name: album.albumName,
    h1: album.albumH1,
    h2: album.albumH2,
    version: album.albumVersion,
    thumbPath: utils.thumbPath({ filename: album.filename }, gallery),
    year: album.year,
  })

  if (Array.isArray(dirty.gallery.album)) {
    return { albums: dirty.gallery.album.map(transform) }
  }
  return { albums: [transform(dirty.gallery.album)] }
}

/**
 * Get Albums from local filesystem
 * @param {string} gallery name of gallery
 * @param {boolean} returnEnvelope will enable a return value with HTTP status code and body
 * @returns {Object} albums containing name, h1, h2, version, thumbPath, year
 */
async function get(gallery, returnEnvelope = false) {
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

module.exports = {
  get,
  errorSchema,
  getGalleryFromFilesystem,
  transformJsonSchema,
}
