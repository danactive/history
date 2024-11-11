import { randomUUID } from 'node:crypto'

import config from '../../config.json'
import utilsFactory from '../lib/utils'
import type {
  Album,
  AlbumMeta,
  Item,
  ItemReferenceSource,
  Person,
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

function caption(item: XmlItem) {
  if (item.type === 'video') {
    return `Video: ${item.thumbCaption}`
  }

  return item.thumbCaption
}

function assertCannotReach(x: never) {
  throw new Error(`Reference source missing: TypeScript should block this at compile time ${x}`)
}

export const persons = (photoSearchValues: XmlItem['search'], definedPersonInclusionList: Person[]): string | null => {
  if (photoSearchValues) {
    const output: string[] = []
    const names = photoSearchValues.split(', ')

    for (let p = 0; p < definedPersonInclusionList.length; p += 1) {
      if (names.includes(definedPersonInclusionList[p].full)) {
        output.push(definedPersonInclusionList[p].full)
      }
      if (output.length === names.length) {
        break
      }
    }

    if (output.length > 0) {
      return output.join(', ')
    }
    return null
  }
  return null
}

export const reference = (item: XmlItem): [string, string] | null => {
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
 * @param {object} dirty
 * @returns {object} clean JSON
 */
const transformJsonSchema = (dirty: XmlAlbum): Album => {
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
    const id = item?.$?.id ?? randomUUID()
    if (!('filename' in item)) {
      throw new ReferenceError(`XML is missing <filename> element in parent <item id="${id}" /> element`)
    }
    const { filename } = item
    if (!('photoCity' in item)) {
      throw new ReferenceError(`XML is missing <photo_city> element in parent <item id="${id}" filename="${filename}" /> element`)
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
      city: item.photoCity,
      location: item.photoLoc || null,
      caption: caption(item),
      description: item.photoDesc || null,
      search: item.search || null,
      persons: persons(item.search, []),
      title: title(item),
      coordinates: longitude && latitude ? [longitude, latitude] : null,
      coordinateAccuracy: (accuracy === null || accuracy === 0 || Number.isNaN(accuracy)) ? null : accuracy,
      thumbPath,
      photoPath,
      mediaPath: (item.type === 'video' && videoPaths) ? videoPaths[0] : photoPath,
      videoPaths,
      reference: reference(item),
    }

    return removeUndefinedFields(out)
  }

  const items = Array.isArray(dirty.album.item) ? dirty.album.item.map(updateItem) : [updateItem(dirty.album.item)]

  return {
    album: {
      meta,
      items,
    },
  }
}

export default transformJsonSchema
