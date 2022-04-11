const camelCase = require('camelcase')
const fsCallback = require('fs')
const xml2js = require('xml2js')
const { promisify } = require('util')

const utilsFactory = require('./utils')

const errorSchema = (message) => {
  const out = { album: [] }
  if (!message) return out
  return { ...out, error: { message } }
}
const fs = fsCallback.promises
const parseOptions = { explicitArray: false, normalizeTags: true, tagNameProcessors: [(name) => camelCase(name)] }
const parser = new xml2js.Parser(parseOptions)
const parseXml = promisify(parser.parseString)
const utils = utilsFactory(errorSchema)

/**
* Get album XML from local filesystem
* @param {string} gallery name of gallery
* @param {string} album name of album
* @returns {string} album XML
*/
async function getXmlFromFilesystem(gallery, album) {
  const fileBuffer = await fs.readFile(`../public/galleries/${gallery}/${album}.xml`)
  return parseXml(fileBuffer)
}

function title(item) {
  const presentable = (...values) => values.every((value) => value !== undefined && value !== '')
  if (presentable(item.photoLoc, item.photoCity, item.photoDesc)) {
    return `${item.photoLoc} (${item.photoCity}): ${item.photoDesc}`
  }

  if (presentable(item.photoLoc, item.photoCity)) {
    return `${item.photoLoc} (${item.photoCity})`
  }

  if (presentable(item.photoLoc, item.photoDesc)) {
    return `${item.photoLoc}: ${item.photoDesc}`
  }

  if (presentable(item.photoCity, item.photoDesc)) {
    return `${item.photoCity}: ${item.photoDesc}`
  }

  if (presentable(item.photoLoc)) {
    return item.photoLoc
  }

  if (presentable(item.photoCity)) {
    return item.photoCity
  }

  return item.photoDesc || null
}

function caption(item) {
  if (item.type === 'video') {
    return `Video: ${item.thumbCaption}`
  }

  return item.thumbCaption || null
}

const reference = (item) => {
  const baseUrl = (source) => {
    switch (source) {
      case 'facebook':
        return 'https://www.facebook.com/'
      case 'google':
        return 'https://www.google.com/search?q='
      case 'wikipedia':
        return 'https://en.wikipedia.org/wiki/'
      case 'youtube':
        return 'https://www.youtube.com/watch?v='
      default:
        return ''
    }
  }
  if (item?.ref?.name) {
    return [baseUrl(item.ref?.source) + item.ref.name, item.ref.name]
  }
  if (item.ref?.source) {
    return [baseUrl(item.ref?.source), '']
  }
  return null
}

/**
 * Transform dirty JSON from XML into clean JSON schema
 * @param {object} dirty
 * @returns {object} clean JSON
 */
const transformJsonSchema = (dirty = {}) => {
  if (!dirty.album || !dirty.album.meta) {
    return dirty
  }

  if (!dirty.album.item) {
    return { album: { items: [], ...dirty.album } }
  }

  const { gallery } = dirty.album.meta

  const updateItem = (item) => {
    const latitude = item?.geo?.lat ? parseFloat(item.geo.lat) : null
    const longitude = item?.geo?.lon ? parseFloat(item.geo.lon) : null
    const accuracy = Number(item?.geo?.accuracy)

    const thumbPath = utils.thumbPath(item, gallery)
    const photoPath = utils.photoPath(item, gallery)
    const videoPaths = utils.getVideoPaths(item, gallery)

    const out = {
      id: item.$.id,
      filename: item.filename,
      city: item.photoCity || null,
      location: item.photoLoc || null,
      caption: caption(item),
      description: item.photoDesc || null,
      search: item.search || null,
      title: title(item),
      coordinates: longitude && latitude ? [longitude, latitude] : null,
      coordinateAccuracy: (!accuracy || accuracy === 0 || Number.isNaN(accuracy)) ? null : accuracy,
      thumbPath,
      photoPath,
      mediaPath: (item.type === 'video') ? videoPaths[0] : photoPath,
      videoPaths,
      reference: reference(item),
    }

    // remove empty properties
    return Object.fromEntries(Object.entries(out).filter(([_, v]) => v != null))
  }

  const items = dirty.album.item.length ? dirty.album.item.map(updateItem) : [updateItem(dirty.album.item)]
  const meta = {
    ...dirty.album.meta,
    geo: {
      ...dirty.album.meta.geo,
      zoom: Number(dirty.album.meta.geo.googleZoom) || 17,
    },
  }

  return {
    album: {
      meta,
      items,
    },
  }
}

/**
 * Get Album XML from local filesystem
 * @param {string} gallery name of gallery
 * @param {string} album name of album
 * @param {boolean} returnEnvelope will enable a return value with HTTP status code and body
 * @returns {object} album containing meta and items with keys filename, photoCity, photoLoc, thumbCaption, photoDesc
 */
async function get(gallery, album, returnEnvelope = false) {
  try {
    const xml = await getXmlFromFilesystem(gallery, album)
    const body = transformJsonSchema(xml)

    if (returnEnvelope) {
      return { body, status: 200 }
    }

    return body
  } catch (e) {
    if (returnEnvelope) {
      return { body: errorSchema('No album was found'), status: 404 }
    }

    return errorSchema()
  }
}

module.exports = {
  get,
  errorSchema,
  reference,
  transformJsonSchema,
}
