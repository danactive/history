import fs from 'node:fs/promises'
import { join, relative, resolve, sep } from 'node:path'
import { parseStringPromise } from 'xml2js'
import * as z from 'zod/v4'
import { generatedGalleries } from '../../types/generated'
import type { RawXmlItem } from '../../types/common'
import { mapCountries, type MapCountry, type RegionCollection } from '../../components/VisitedMap/regions'
import { identifier } from './model'
import { digest, isMissing } from './files'
import { parseCriticalTagsConfig } from '../critical-tags'

const list = <T>(value: T | T[] | undefined): T[] => value === undefined ? [] : Array.isArray(value) ? value : [value]
const itemSchema = z.object({
  $: z.object({ id: z.string().min(1) }), filename: z.union([z.string().min(1), z.array(z.string().min(1)).min(1)]),
  photo_date: z.string().nullable().optional(), photo_city: z.string().optional(), photo_loc: z.string().optional(),
  photo_desc: z.string().optional(), thumb_caption: z.string().optional(), search: z.string().optional(),
  type: z.enum(['photo', 'video']).optional(),
}).passthrough()

export type SourceAlbum = {
  gallery: string, album: string, title: string, revision: string, path: string, items: RawXmlItem[],
}
export type Inventory = {
  albums: SourceAlbum[], errors: string[], versions: Record<string, string>, tags: string[],
  boundaries: Partial<Record<MapCountry, { data?: RegionCollection, error?: boolean }>>,
}

export async function safeRead(root: string, path: string) {
  const actual = await fs.realpath(path)
  const base = await fs.realpath(root)
  const rel = relative(base, actual)
  if (rel === '..' || rel.startsWith(`..${sep}`) || resolve(base, rel) !== actual) throw new Error('Source outside library')
  return fs.readFile(actual, 'utf8')
}

export async function inventory(root: string, galleries: readonly string[] = generatedGalleries): Promise<Inventory> {
  const result: Inventory = { albums: [], errors: [], versions: {}, tags: [], boundaries: {} }
  const load = async (path: string) => {
    const content = await safeRead(root, path)
    result.versions[path] = digest(content)
    return content
  }
  const configPath = join(root, 'config.local.json')
  try {
    const config: unknown = JSON.parse(await load(configPath))
    z.object({ 'critical-tags': z.array(z.string()).optional() }).parse(config)
    result.tags = parseCriticalTagsConfig(config)
  } catch (error) {
    if (isMissing(error)) result.versions[configPath] = 'absent'
    else result.errors.push('Unable to read valid local configuration')
  }
  for (const gallery of galleries) {
    try {
      identifier.parse(gallery)
      const base = join(root, 'public', 'galleries', gallery)
      const document = await parseStringPromise(await load(join(base, 'gallery.xml')), { explicitArray: false })
      if (!document || !Object.hasOwn(document, 'gallery')) throw new Error('Invalid gallery')
      const entries = list(document.gallery?.album) as { album_name?: unknown, album_h1?: unknown }[]
      for (const entry of entries) {
        try {
          const album = identifier.parse(entry.album_name)
          const path = join(base, `${album}.xml`)
          const xml = await load(path)
          const parsed = await parseStringPromise(xml, { explicitArray: false })
          if (!parsed || !Object.hasOwn(parsed, 'album')) throw new Error('Invalid album')
          const items = list(parsed.album?.item).map(item => {
            const raw = itemSchema.parse(item)
            return { ...raw, photo_date: raw.photo_date ?? null, photo_city: raw.photo_city ?? '' } as RawXmlItem
          })
          const ids = items.map(item => item.$.id)
          if (new Set(ids).size !== ids.length) throw new Error('Duplicate item IDs')
          if (result.albums.some(source => source.gallery === gallery && source.album === album)) throw new Error('Duplicate album')
          result.albums.push({ gallery, album, path, title: String(entry.album_h1 ?? album), revision: digest(xml), items })
        } catch {
          result.errors.push(`Unable to read valid album: ${gallery}/${String(entry.album_name)}`)
        }
      }
    } catch { result.errors.push(`Unable to read gallery: ${gallery}`) }
  }
  for (const country of Object.keys(mapCountries) as MapCountry[]) {
    const path = join(root, 'public', 'maps', 'visited', `${mapCountries[country].file}.geojson`)
    try {
      const data = JSON.parse(await load(path)) as RegionCollection
      if (data.type !== 'FeatureCollection' || !Array.isArray(data.features)
        || data.features.some(feature => !feature.properties?.id || !feature.properties?.name
          || !Array.isArray(feature.properties.aliases))) throw new Error('Invalid boundaries')
      result.boundaries[country] = { data }
    } catch { result.boundaries[country] = { error: true } }
  }
  return result
}

export async function verifyInventory(root: string, versions: Record<string, string>) {
  for (const [path, version] of Object.entries(versions)) {
    try {
      if (digest(await safeRead(root, path)) !== version) return false
    } catch (error) { if (!(version === 'absent' && isMissing(error))) return false }
  }
  return true
}
