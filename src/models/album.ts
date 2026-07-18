import utilsFactory from '../lib/utils'
import type {
  Album,
  AlbumMeta,
  Item,
  Person,
  PersonItem,
  XmlAlbum,
  XmlItem,
} from '../types/common'
import { getPrimaryFilename, isNotEmpty, removeUndefinedFields } from '../utils'
import { transformReference } from '../utils/reference'
import config from './config'
import { parseXmlAlbumInput } from './schemas'

export type ErrorOptionalMessage = { album: object[]; error?: { message: string } }
export const errorSchema = (message: string): ErrorOptionalMessage => {
  const out = { album: [] }
  if (!message) return out
  return { ...out, error: { message } }
}

const utils = utilsFactory()

function title(item: XmlItem): string {
  const photoCity = item.photoCity ?? ''
  const photoLoc = item.photoLoc ?? ''

  if (isNotEmpty(photoLoc) && isNotEmpty(photoCity)) {
    return `${photoLoc} (${photoCity})`
  }

  if (isNotEmpty(photoLoc)) {
    return photoLoc
  }

  if (isNotEmpty(photoCity)) {
    return photoCity
  }

  // If both are empty, return a default
  return 'Untitled'
}

function transformCaption(item: XmlItem) {
  const thumbCaption = item.thumbCaption ?? ''

  if (thumbCaption === '') {
    // Use filename as fallback caption
    const filename = getPrimaryFilename(item.filename)
    return filename
  }

  if (item.type === 'video') {
    return `Video: ${thumbCaption}`
  }

  return thumbCaption
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

function transformMeta(dirtyMeta: NonNullable<XmlAlbum['album']['meta']>): AlbumMeta {
  const { markerZoom, ...cleanMeta } = dirtyMeta
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
const transformJsonSchema = (dirty: unknown, persons: Person[]): Album => {
  const validated = parseXmlAlbumInput(dirty)
  const meta = transformMeta(validated.album.meta)
  if (!('gallery' in meta) || !meta.gallery) {
    throw new ReferenceError('XML is missing <gallery> element in parent <meta> element')
  }

  if (validated.album.item === undefined) {
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
    // Allow photoCity to be optional, default to empty string if missing
    const photoCity = item.photoCity ?? ''

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
      city: photoCity,
      location: item.photoLoc || null,
      caption: transformCaption(item),
      description: item.photoDesc || null,
      search: item.search || null,
      persons: transformPersons(item.search, persons),
      title: title(item),
      coordinates: longitude !== null && latitude !== null ? [longitude, latitude] : null,
      coordinateAccuracy: (accuracy === null || accuracy === 0 || Number.isNaN(accuracy)) ? null : accuracy,
      thumbPath,
      photoPath,
      mediaPath: (item.type === 'video' && videoPaths) ? videoPaths[0] : photoPath,
      videoPaths,
      reference: transformReference(item?.ref),
    }

    return removeUndefinedFields(out)
  }

  const items = Array.isArray(validated.album.item) ? validated.album.item.map(updateItem) : [updateItem(validated.album.item)]

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
