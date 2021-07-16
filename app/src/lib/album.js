const clone = require('clone')
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
* @returns {string} album XML
*/
async function getAlbumFromFilesystem() {
  const fileBuffer = await fs.readFile('../public/galleries/demo/sample.xml')
  const xml = await parseXml(fileBuffer)
  return xml
}

const jpgFilenameInsensitive = (filename) => {
  const currentExt = utils.type(filename)
  const futureExt = (currentExt.toLowerCase() === 'jpg') ? currentExt : 'jpg'
  const imageFilename = filename.replace(currentExt, futureExt)
  return imageFilename
}

const getThumbPath = (item, gallery) => {
  if (!item || !item.filename) {
    return undefined
  }

  const filename = (typeof item.filename === 'string') ? item.filename : item.filename[0]
  const imageFilename = jpgFilenameInsensitive(filename)
  const year = imageFilename.indexOf('-') >= 0 && imageFilename.split('-')[0]
  return `/galleries/${gallery}/media/thumbs/${year}/${imageFilename}`
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
  const presentable = (...values) => values.every((value) => value !== undefined && value !== '');
  if (presentable(item.photoLoc, item.photoCity, item.photoDesc)) {
    return `${item.photoLoc} (${item.photoCity}): ${item.photoDesc}`;
  }

  if (presentable(item.photoLoc, item.photoCity)) {
    return `${item.photoLoc} (${item.photoCity})`;
  }

  if (presentable(item.photoLoc, item.photoDesc)) {
    return `${item.photoLoc}: ${item.photoDesc}`;
  }

  if (presentable(item.photoCity, item.photoDesc)) {
    return `${item.photoCity}: ${item.photoDesc}`;
  }

  if (presentable(item.photoLoc)) {
    return item.photoLoc;
  }

  if (presentable(item.photoCity)) {
    return item.photoCity;
  }

  return item.photoDesc;
}

function caption(item) {
  if (item.type === 'video') {
    return `Video: ${item.thumbCaption}`;
  }

  return item.thumbCaption;
}

/**
 * Transform dirty JSON from XML into clean JSON schema
 * @param dirty
 * @returns {object} clean JSON
 */
const transformJsonSchema = (dirty = {}) => {
  if (!dirty.album || !dirty.album.item || !dirty.album.meta) {
    return dirty
  }

  const { gallery } = dirty.album.meta
  const output = clone(dirty)
  delete output.album.item

  output.album.items = dirty.album.item.map((_item) => {
    const item = _item
    item.caption = item.thumbCaption
    if (item.geo) {
      item.geo.lat = parseFloat(item.geo.lat)
      item.geo.lon = parseFloat(item.geo.lon)
    } else {
      item.geo = {
        lat: null,
        lon: null,
      }
    }

    const thumbPath = getThumbPath(item, gallery)
    const photoPath = utils.photoPath(thumbPath)
    const videoPath = getVideoPath(item, gallery)
    const enhancements = {
      thumbCaption: caption(item),
      title: title(item),
      thumbPath,
      mediaPath: (item.type === 'video') ? videoPath : photoPath,
    }

    return Object.assign(item, enhancements)
  })

  return output
}

/**
 * Get Albums from local filesystem
 * @param {boolean} returnEnvelope will enable a return value with HTTP status code and body
 * @returns {Promise} galleries
 */
async function get(returnEnvelope = false) {
  try {
    const xml = await getAlbumFromFilesystem()
    const body = { album: transformJsonSchema(xml) }

    if (returnEnvelope) {
      return { body, status: 200 }
    }

    return body
  } catch (e) {
    console.log('catch error', e)
    if (returnEnvelope) {
      return { body: errorSchema('No albums were found'), status: 404 }
    }

    return errorSchema()
  }
}

module.exports = {
  get,
  errorSchema,
  jpgFilenameInsensitive,
  getThumbPath,
  getVideoPath,
  transformJsonSchema,
}
