import * as z from 'zod/v4'
import type { XmlAlbum, XmlItem } from '../types/common'
import { generatedGallerySchema } from '../types/generated'

type ParsedXmlAlbum = {
  album: {
    meta: NonNullable<XmlAlbum['album']['meta']>,
    item?: XmlItem | XmlItem[],
  },
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

const itemReferenceSourceSchema = z.enum(['facebook', 'google', 'instagram', 'wikipedia', 'youtube'])

const xmlMetaInputSchema = z.object({
  gallery: generatedGallerySchema,
  albumName: z.string().optional(),
  albumVersion: z.string().optional(),
  markerZoom: z.string().optional(),
  clusterMaxZoom: z.string().optional(),
}).strip()

const xmlGeoInputSchema = z.object({
  lat: z.string(),
  lon: z.string(),
  accuracy: z.string().optional().default(''),
}).strip()

const xmlReferenceInputSchema = z.object({
  name: z.string(),
  source: itemReferenceSourceSchema,
}).strip()

const xmlItemInputSchema = z.object({
  $: z.object({
    id: z.string().trim().min(1),
  }).strip(),
  type: z.enum(['video', 'photo']).optional(),
  size: z.object({ w: z.string(), h: z.string() }).strip().optional(),
  filename: z.union([z.string(), z.array(z.string())]),
  search: z.string().optional(),
  geo: xmlGeoInputSchema.optional(),
  ref: xmlReferenceInputSchema.optional(),
  photoDate: z.string().nullable().optional().default(null),
  photoCity: z.string().optional().default(''),
  photoLoc: z.string().optional(),
  thumbCaption: z.string().optional().default(''),
  photoDesc: z.string().optional(),
}).strip()

const xmlAlbumEnvelopeSchema = z.object({
  album: z.object({
    meta: z.unknown(),
    item: z.unknown().optional(),
  }).strip(),
}).strip()

function getFilenameId(filename: unknown) {
  if (Array.isArray(filename)) {
    return typeof filename[0] === 'string' ? filename[0] : ''
  }
  return typeof filename === 'string' ? filename : ''
}

function getItemId(item: unknown) {
  if (isRecord(item) && '$' in item && isRecord(item.$)) {
    const attributes = item.$
    if (typeof attributes.id === 'string') {
      return attributes.id.trim()
    }
  }

  return ''
}

function getItemValue(item: unknown, key: 'filename' | '$') {
  if (isRecord(item) && key in item) {
    return item[key]
  }
  return undefined
}

function formatIssuePath(path: PropertyKey[]) {
  if (path.length === 0) return 'root'
  return path.map(segment => typeof segment === 'number' ? `[${segment}]` : String(segment)).join('.')
}

function formatIssue(issue: z.core.$ZodIssue) {
  const path = formatIssuePath(issue.path ?? [])
  if (issue.message !== 'Invalid input') {
    return `${path}: ${issue.message}`
  }

  if ('values' in issue && Array.isArray(issue.values)) {
    const expected = issue.values.map(value => JSON.stringify(value)).join(', ')
    const received = 'input' in issue ? JSON.stringify(issue.input) : 'unknown'
    return `${path}: invalid value ${received}; expected one of ${expected}`
  }

  if ('expected' in issue) {
    const expected = String(issue.expected)
    const received = 'input' in issue ? JSON.stringify(issue.input) : 'unknown'
    return `${path}: invalid value ${received}; expected ${expected}`
  }

  return `${path}: ${issue.message}`
}

function validationMessage(error: z.ZodError) {
  return error.issues.map(formatIssue).join('; ') || 'Input validation failed'
}

export function parseXmlAlbumInput(dirty: unknown): ParsedXmlAlbum {
  const envelope = xmlAlbumEnvelopeSchema.safeParse(dirty)
  if (!envelope.success) {
    const path = envelope.error.issues[0]?.path ?? []
    if (path[0] === 'album' && path[1] === 'meta') {
      throw new ReferenceError('XML is missing <meta> element in parent <album> element')
    }
    throw new ReferenceError('XML is missing <album> element in parent root element')
  }

  const meta = xmlMetaInputSchema.safeParse(envelope.data.album.meta)
  if (!meta.success) {
    const rawMeta = envelope.data.album.meta
    if (!isRecord(rawMeta) || !('gallery' in rawMeta) || !rawMeta.gallery) {
      throw new ReferenceError('XML is missing <gallery> element in parent <meta> element')
    }
    throw new ReferenceError(`XML validation failed in <meta> element: ${validationMessage(meta.error)}`)
  }

  if (envelope.data.album.item === undefined) {
    return {
      album: {
        meta: meta.data,
      },
    }
  }

  const rawItems = Array.isArray(envelope.data.album.item)
    ? envelope.data.album.item
    : [envelope.data.album.item]

  const items = rawItems.map((rawItem) => {
    const id = getItemId(rawItem)
    if (!id) {
      throw new ReferenceError('XML is missing id attribute in <item /> element')
    }

    const rawFilename = getItemValue(rawItem, 'filename')
    if (rawFilename === undefined) {
      throw new ReferenceError(`XML is missing <filename> element in parent <item id="${id}" /> element`)
    }

    const item = xmlItemInputSchema.safeParse(rawItem)
    if (!item.success) {
      const filenameId = getFilenameId(rawFilename)
      const filenameIssue = item.error.issues.find(issue => issue.path[0] === 'filename')
      if (filenameIssue) {
        throw new ReferenceError(`XML is missing <filename> element in parent <item id="${id}" filename="${filenameId}" /> element`)
      }
      throw new ReferenceError(`XML validation failed in <item id="${id}" filename="${filenameId}" /> element: ${validationMessage(item.error)}`)
    }

    return item.data
  })

  return {
    album: {
      meta: meta.data,
      item: Array.isArray(envelope.data.album.item) ? items : items[0],
    },
  }
}

export {
  itemReferenceSourceSchema,
  xmlGeoInputSchema,
  xmlItemInputSchema,
  xmlMetaInputSchema,
  xmlReferenceInputSchema,
}

