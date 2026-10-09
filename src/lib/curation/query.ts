import { join } from 'node:path'
import * as z from 'zod/v4'
import { currentSnapshot, readShard, scanStatus } from './engine'
import { readJson, stateDirectory } from './files'
import { categorySchema, identifier, normalizePlace, type InboxResult, type CurationRow } from './model'
import { getDefaultMonthDay } from '../monthDay'

export const querySchema = z.object({
  place: z.string().max(200).default(''), category: z.union([categorySchema, z.literal('')]).default(''),
  gallery: z.union([identifier, z.literal('')]).default(''), album: z.string().max(200).default(''),
  page: z.coerce.number().int().min(1).max(1000000).default(1),
  focus: z.enum(['', 'today']).default(''),
})
export type InboxQuery = z.infer<typeof querySchema>
const pageSize = 30
const rank = (row: CurationRow) => Math.min(...row.findings.map(finding => ['location', 'tags', 'description'].indexOf(finding.category)))
const compare = (a: CurationRow, b: CurationRow) => a.places[0].localeCompare(b.places[0]) || rank(a) - rank(b) || a.id.localeCompare(b.id)

export async function getInbox(root: string, query: InboxQuery, now = new Date()): Promise<InboxResult> {
  const monthDay = getDefaultMonthDay(now)
  const isToday = (row: CurationRow) => row.scope === 'photo' && row.monthDay === monthDay
  const snapshot = await currentSnapshot(root)
  const status = await scanStatus(root)
  const awaiting = Object.keys(await readJson<Record<string, string>>(join(stateDirectory(root), 'awaiting.json')) ?? {})
  const result: InboxResult = {
    rows: [], snapshot, status, page: query.page, pages: 1,
    counts: { findings: 0, photos: 0, albums: 0, rows: 0 }, galleries: [], albums: [], places: [], awaiting,
    today: { monthDay, photos: 0, findings: 0 },
  }
  if (!snapshot) return result
  const galleries = new Set<string>(), albums = new Set<string>(), places = new Set<string>(), affectedAlbums = new Set<string>()
  const candidates: CurationRow[] = []
  for (const name of snapshot.shards) {
    const shard = await readShard(root, snapshot, name)
    for (const original of shard.rows) {
      const { gallery, album } = original.source
      const key = `${gallery}/${album}`
      galleries.add(gallery)
      if (!query.gallery || query.gallery === gallery) albums.add(key)
      original.places.forEach(place => places.add(place))
      if (query.gallery && query.gallery !== gallery || query.album && query.album !== key) continue
      if (query.place && !original.places.some(place => normalizePlace(place).includes(normalizePlace(query.place)))) continue
      const findings = original.findings.filter(finding => !query.category || finding.category === query.category)
      if (!findings.length) continue
      const matchedPlaces = query.place ? [...original.places].sort((a, b) =>
        Number(normalizePlace(b).includes(normalizePlace(query.place))) - Number(normalizePlace(a).includes(normalizePlace(query.place))))
        : original.places
      const row = { ...original, findings, places: matchedPlaces }
      if (isToday(row)) {
        result.today!.photos++
        result.today!.findings += findings.length
      }
      if (query.focus === 'today' && !isToday(row)) continue
      result.counts.rows++
      result.counts.findings += findings.length
      if (row.scope === 'photo') result.counts.photos++
      affectedAlbums.add(key)
      candidates.push(row)
    }
  }
  result.pages = Math.max(1, Math.ceil(result.counts.rows / pageSize))
  result.page = Math.min(query.page, result.pages)
  result.rows = candidates.sort((a, b) => Number(isToday(b)) - Number(isToday(a)) || compare(a, b))
    .slice((result.page - 1) * pageSize, result.page * pageSize)
  result.counts.albums = affectedAlbums.size
  result.galleries = [...galleries].sort()
  result.albums = [...albums].sort()
  result.places = [...places].sort().filter(place => !query.place || normalizePlace(place).includes(normalizePlace(query.place))).slice(0, 100)
  return result
}

export async function findRow(root: string, id: string) {
  const snapshot = await currentSnapshot(root)
  if (!snapshot) return null
  for (const name of snapshot.shards) {
    const row = (await readShard(root, snapshot, name)).rows.find(row => row.id === id)
    if (row) return row
  }
  return null
}
