import config from './config'
import utilsFactory from '../lib/utils'
import type {
  Album,
  AlbumMeta,
  Item,
  ItemReferenceSource,
  Person,
  PersonItem,
  XmlAlbum,
  XmlItem,
} from '../types/common'
import { isNotEmpty, removeUndefinedFields } from '../utils'

export type ErrorOptionalMessage = { album: object[]; error?: { message: string } }
export const errorSchema = (message: string): ErrorOptionalMessage => {
  const out = { album: [] }
  if (!message) return out
  return { ...out, error: { message } }
}

const utils = utilsFactory()

type DebugInfo = { id: string, filenameId: string }
function missingXmlMessage(xmlElement: string, debug: DebugInfo) {
  return `XML is missing <${xmlElement}> element in parent <item id="${debug.id}" filename="${debug.filenameId}" /> element`
}

function isValidMeta(schema: unknown): schema is { album: { meta: Album['album']['meta'], item: XmlAlbum['album']['item'] } } {
  if (
    'album' in (schema as any)
    && 'meta' in ((schema as any).album)
    && 'gallery' in ((schema as any).album.meta)
  ) {
    return true
  }
  return false
}

function isValidItem(schema: unknown): schema is Item {
  if ('item' in ((schema as any).album)) {
    return true
  }
  return false
}

function title(item: XmlItem): string {
  if (isNotEmpty(item.photoLoc) && isNotEmpty(item.photoCity)) {
    return `${item.photoLoc} (${item.photoCity})`
  }

  if (isNotEmpty(item.photoLoc)) {
    return item.photoLoc
  }

  return item.photoCity
}

function transformCaption(item: XmlItem, debug: DebugInfo) {
  if (!('thumbCaption' in item) || item.thumbCaption === '') {
    throw new ReferenceError(missingXmlMessage('thumb_caption', debug))
  }

  if (item.type === 'video') {
    return `Video: ${item.thumbCaption}`
  }

  return item.thumbCaption
}

function assertCannotReach(x: never) {
  throw new Error(`Reference source missing: TypeScript should block this at compile time ${x}`)
}

export const transformPersons = (photoSearchValues: XmlItem['search'], definedPersonInclusionList: Person[]): PersonItem[] | null => {
  if (photoSearchValues) {
    const output: PersonItem[] = []
    const names = photoSearchValues.split(', ')

    for (let n = 0; n < names.length; n += 1) {
      const name = names[n]
      for (let p = 0; p < definedPersonInclusionList.length; p += 1) {
        const person = definedPersonInclusionList[p]
        if (name === person.full) {
          output.push({ full: person.full, dob: person.dob })
          break // Break the inner loop once a match is found
        }
      }
    }

    if (output.length > 0) {
      return output
    }
    return null
  }
  return null
}

export const transformReference = (item: XmlItem): [string, string] | null => {
  const baseUrl = (source: ItemReferenceSource) => {
    switch (source) {
      case 'facebook':
        return 'https://www.facebook.com/'
      case 'google':
        return 'https://www.google.com/search?q='
      case 'instagram':
        return 'https://www.instagram.com/'
      case 'wikipedia':
        return 'https://en.wikipedia.org/wiki/'
      case 'youtube':
        return 'https://www.youtube.com/watch?v='
      default:
        return assertCannotReach(source)
    }
  }
  if (!('ref' in item) || !item.ref) {
    return null
  }
  if ('name' in item.ref && 'source' in item.ref) {
    return [baseUrl(item.ref.source) + item.ref.name, item.ref.name]
  }
  return null
}

function transformMeta(dirty: XmlAlbum): AlbumMeta {
  if (!isValidMeta(dirty)) {
    return {
      geo: {
        zoom: config.defaultZoom,
      },
    }
  }

  const { markerZoom, ...cleanMeta } = dirty.album.meta
  const zoom = Number(markerZoom) === 0 || Number.isNaN(Number(markerZoom)) ? config.defaultZoom : Number(markerZoom)
  return {
    ...cleanMeta,
    geo: {
      zoom,
    },
  }
}

/**
 * Transform dirty JSON from XML into clean JSON schema
 * @param {object} dirty raw XML before processing
 * @returns {object} clean JSON
 */
const transformJsonSchema = (dirty: XmlAlbum, persons: Person[]): Album => {
  if (!('album' in dirty)) {
    throw new ReferenceError('XML is missing <album> element in parent root element')
  }
  if (!('meta' in dirty.album)) {
    throw new ReferenceError('XML is missing <meta> element in parent <album> element')
  }
  const meta = transformMeta(dirty)
  if (!('gallery' in meta) || !meta.gallery) {
    throw new ReferenceError('XML is missing <gallery> element in parent <meta> element')
  }

  if (!isValidItem(dirty)) {
    return { album: { items: [], meta } }
  }

  const { gallery } = meta

  const updateItem = (item: XmlItem | undefined): Item => {
    if (!item) {
      throw new ReferenceError('XML is missing <item> element in parent <album> element')
    }
    if (!item.$ || !item.$.id || String(item.$.id).trim() === '') {
      throw new ReferenceError('XML is missing id attribute in <item /> element')
    }
    const id = String(item.$.id).trim()

    if (!('filename' in item)) {
      throw new ReferenceError(`XML is missing <filename> element in parent <item id="${id}" /> element`)
    }

    const { filename, photoDate } = item
    const debugInfo = {
      id,
      filenameId: Array.isArray(filename) ? filename[0] : filename,
    }

    if (!('photoCity' in item)) {
      throw new ReferenceError(missingXmlMessage('photo_city', debugInfo))
    }

    const latitude = item?.geo?.lat ? parseFloat(item.geo.lat) : null
    const longitude = item?.geo?.lon ? parseFloat(item.geo.lon) : null
    const accuracy = item?.geo?.accuracy ? Number(item.geo.accuracy) : null

    const thumbPath = utils.thumbPath(item.filename, gallery)
    const photoPath = utils.photoPath(item.filename, gallery)
    const videoPaths = utils.getVideoPaths(item.filename, gallery)

    const out: Item = {
      id,
      filename,
      photoDate: photoDate || null,
      city: item.photoCity,
      location: item.photoLoc || null,
      caption: transformCaption(item, debugInfo),
      description: item.photoDesc || null,
      search: item.search || null,
      persons: transformPersons(item.search, persons),
      title: title(item),
      coordinates: longitude && latitude ? [longitude, latitude] : null,
      coordinateAccuracy: (accuracy === null || accuracy === 0 || Number.isNaN(accuracy)) ? null : accuracy,
      thumbPath,
      photoPath,
      mediaPath: (item.type === 'video' && videoPaths) ? videoPaths[0] : photoPath,
      videoPaths,
      reference: transformReference(item),
    }

    return removeUndefinedFields(out)
  }

  const items = Array.isArray(dirty.album.item) ? dirty.album.item.map(updateItem) : [updateItem(dirty.album.item)]

  // Ensure IDs are unique across the album
  const seen = new Set<string>()
  for (const it of items) {
    if (seen.has(it.id)) {
      throw new ReferenceError(`Duplicate <item id="${it.id}"> found in album`)
    }
    seen.add(it.id)
  }

  return {
    album: {
      meta,
      items,
    },
  }
}

export default transformJsonSchema
