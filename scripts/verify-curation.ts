import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { join } from 'node:path'
import { performance } from 'node:perf_hooks'
import { curationFixture, fixtureGallery, fixtureItem } from '../src/lib/curation/fixtures'
import { runScan, currentSnapshot, scanStatus, markAwaiting } from '../src/lib/curation/engine'
import { getInbox, querySchema } from '../src/lib/curation/query'
import { stageSuggestion } from '../src/lib/curation/review'
import { readAlbumVersion, writeAlbum, AlbumRevisionConflict } from '../src/lib/xml'
import { buildEditedAlbumXml } from '../src/models/album-xml'

const root = await curationFixture()
const previousCwd = process.cwd()
const started = performance.now()
const options = { galleries: ['demo', 'dan'] }
try {
  const albums = Object.fromEntries(Array.from({ length: 100 }, (_, index) => [
    `album${index}`, Array.from({ length: 100 }, (_, item) => fixtureItem(String(item), 'Toronto, Ontario, Canada')).join(''),
  ]))
  await fixtureGallery(root, 'demo', { ...albums, review: fixtureItem('42') })
  await fixtureGallery(root, 'dan', { review: fixtureItem('42') })
  const media = join(root, 'public/galleries/demo/original.bin')
  await fs.writeFile(media, Buffer.from([0, 1, 2, 255]))
  const scanStart = performance.now()
  await runScan(root, 'full', options)
  assert.equal((await scanStatus(root)).state, 'complete')
  const fullScanMs = performance.now() - scanStart
  const beforeQuery = await currentSnapshot(root)
  const queryStart = performance.now()
  const inbox = await getInbox(root, querySchema.parse({ place: 'old montreal' }))
  const queryMs = performance.now() - queryStart
  assert.equal(inbox.counts.photos, 10002)
  assert.equal(inbox.rows.length, 30)
  assert.deepEqual(await currentSnapshot(root), beforeQuery)
  const payloadBytes = Buffer.byteLength(JSON.stringify(inbox))
  assert.ok(payloadBytes < 100000, 'A result page must stay bounded')

  // Verify the complete workflow against isolated XML, never the owner library.
  const review = await getInbox(root, querySchema.parse({ category: 'location', gallery: 'demo' }))
  const row = review.rows.find(row => row.source.album === 'review')!
  assert.ok(row)
  process.chdir(root)
  const loaded = await readAlbumVersion('demo', 'review')
  const items = Array.isArray(loaded.data.album.item) ? loaded.data.album.item : [loaded.data.album.item!]
  const staged = stageSuggestion(row, row.findings[0].suggestion!, items, loaded.revision)
  assert.equal((await readAlbumVersion('demo', 'review')).revision, loaded.revision, 'Staging must not write XML')
  const xml = buildEditedAlbumXml(loaded.data, [staged])
  await writeAlbum('demo', 'review', xml, loaded.revision)
  await assert.rejects(writeAlbum('demo', 'review', '<album />', loaded.revision), AlbumRevisionConflict)
  await markAwaiting(root, 'demo/review')
  assert.equal((await getInbox(root, querySchema.parse({ category: 'location', gallery: 'demo' }))).rows.length, 1)
  await runScan(root, 'incremental', options)
  assert.equal((await getInbox(root, querySchema.parse({ category: 'location', gallery: 'demo' }))).rows.length, 0)
  assert.equal((await getInbox(root, querySchema.parse({ category: 'location', gallery: 'dan' }))).rows.length, 1)
  assert.deepEqual(await fs.readFile(media), Buffer.from([0, 1, 2, 255]))

  await runScan(root, 'full', { ...options, afterCheckpoint: async count => { if (count === 10) throw new Error('Fixture interruption') } })
  assert.equal((await scanStatus(root)).state, 'incomplete')
  await runScan(root, 'incremental', options)
  assert.equal((await scanStatus(root)).state, 'complete')
  console.log(JSON.stringify({
    photos: 10002, albums: 102, fullScanMs: Math.round(fullScanMs), queryMs: Math.round(queryMs), payloadBytes,
    peakRssMiB: Math.round(process.resourceUsage().maxRSS / 1024), totalMs: Math.round(performance.now() - started),
    review: 'passed', staleSave: 'rejected', recovery: 'passed', media: 'unchanged',
  }, null, 2))
} finally {
  process.chdir(previousCwd)
  await fs.rm(root, { recursive: true, force: true })
}
