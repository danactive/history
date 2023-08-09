import utilsFactory from '../lib/utils'
import type { Album, AlbumMeta, Item } from '../types/common'
import { removeUndefinedFields } from '../utils'

export type ErrorOptionalMessage = { album: object[]; error?: { message: string } }
export const errorSchema = (message): ErrorOptionalMessage => {
  const out = { album: [] }
  if (!message) return out
  return { ...out, error: { message } }
}

const utils = utilsFactory()

type DirtyItem = {
  $: {
    id: string,
  },
  filename: string,
  photoCity: string,
  thumbCaption: string,
  photoDesc: string,
  geo: {
    lat: string,
    lon: string,
    accuracy: string,
  },
  ref: {
    name: string,
    source: string,
  }
}

type DirtyAlbum = {
  album?: {
    meta?: AlbumMeta,
    item: DirtyItem | DirtyItem[]
  },
}

type ValidMeta = {
  album: {
    meta: {}
  },
}

type ValidItem = {
  album: {
    items: [],
  },
}

function isValidMeta(schema: unknown): schema is ValidMeta {
  if ('album' in (schema as any) && 'meta' in ((schema as any).album)) {
    return true
  }
  return false
}

function isValidItem(schema: unknown): schema is ValidItem {
  if ('item' in ((schema as any).album)) {
    return true
  }
  return false
}

function title(item) {
  const presentable = (...values) => values.every((value) => value !== undefined && value !== '')
  if (presentable(item.photoLoc, item.photoCity)) {
    return `${item.photoLoc} (${item.photoCity})`
  }

  if (presentable(item.photoLoc)) {
    return item.photoLoc
  }

  if (presentable(item.photoCity)) {
    return item.photoCity
  }

  return null
}

function caption(item) {
  if (item.type === 'video') {
    return `Video: ${item.thumbCaption}`
  }

  return item.thumbCaption || null
}

export const reference = (item): [string, string] | null => {
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
const transformJsonSchema = (dirty: DirtyAlbum = {}): Album => {
  if (!isValidMeta(dirty) || !isValidItem(dirty)) {
    return { album: { items: [], ...dirty.album } }
  }

  const { gallery } = dirty.album.meta

  const updateItem = (item): Item => {
    const latitude = item?.geo?.lat ? parseFloat(item.geo.lat) : null
    const longitude = item?.geo?.lon ? parseFloat(item.geo.lon) : null
    const accuracy = Number(item?.geo?.accuracy)

    const thumbPath = utils.thumbPath(item, gallery)
    const photoPath = utils.photoPath(item, gallery)
    const videoPaths = utils.getVideoPaths(item, gallery)

    const out: Item = {
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

    return removeUndefinedFields(out)
  }

  const items = Array.isArray(dirty.album.item) ? dirty.album.item.map(updateItem) : [updateItem(dirty.album.item)]
  const meta = {
    ...dirty.album.meta,
    geo: {
      zoom: Number(dirty.album.meta?.markerZoom) || 17,
    },
  }
  delete meta.markerZoom

  return {
    album: {
      meta,
      items,
    },
  }
}

export default transformJsonSchema
