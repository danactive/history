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

const getVideoPath = (item, gallery) => {
  if (!item || !item.filename) {
    return undefined
  }

  const filename = (typeof item.filename === 'string') ? item.filename : item.filename.join(',')
  const dimensions = (item.size) ? { width: item.size.w, height: item.size.h } : { width: '', height: '' }
  return `/view/video?sources=${filename}&w=${dimensions.width}&h=${dimensions.height}&gallery=${gallery}`
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

  return item.photoDesc
}

function caption(item) {
  if (item.type === 'video') {
    return `Video: ${item.thumbCaption}`
  }

  return item.thumbCaption
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
  return (item?.ref?.name) ? baseUrl(item?.ref?.source) + item.ref.name : undefined
}

/**
 * Transform dirty JSON from XML into clean JSON schema
 * @param {object} dirty
 * @returns {object} clean JSON
 */
const transformJsonSchema = (dirty = {}) => {
  if (!dirty.album || !dirty.album.item || !dirty.album.meta) {
    return dirty
  }

  const { gallery } = dirty.album.meta

  const items = dirty.album.item.map((item) => {
    const geo = {
      lat: null,
      lon: null,
    }
    if (item.geo) {
      geo.lat = parseFloat(item.geo.lat)
      geo.lon = parseFloat(item.geo.lon)
    }

    const thumbPath = utils.thumbPath(item, gallery)
    const photoPath = utils.photoPath(item, gallery)
    const videoPath = getVideoPath(item, gallery)
    return ({
      id: item.$.id,
      filename: item.filename,
      city: item.photoCity,
      location: item.photoLoc,
      caption: caption(item),
      description: item.photoDesc,
      title: title(item),
      geo,
      thumbPath,
      photoPath,
      mediaPath: (item.type === 'video') ? videoPath : photoPath,
      reference: reference(item),
    })
  })

  return {
    album: {
      meta: dirty.album.meta,
      items,
    },
  }
}

/**
 * Get Album XML from local filesystem
 * @param {string} gallery name of gallery
 * @param {string} album name of album
 * @param {boolean} returnEnvelope will enable a return value with HTTP status code and body
 * @returns {object} album containing filename, photoCity, photoLoc, thumbCaption, photoDesc
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
  getVideoPath,
  reference,
  transformJsonSchema,
}
