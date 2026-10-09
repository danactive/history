// @vitest-environment node
import fs from 'node:fs/promises'
import { join } from 'node:path'
import { afterEach, expect, test } from 'vitest'
import { curationFixture, fixtureGallery, fixtureItem } from './fixtures'
import { inventory } from './sources'
import { analyze } from './detectors'
import { runScan, scanStatus, currentSnapshot, enqueue, scheduledMode, markAwaiting } from './engine'
import { getInbox, querySchema } from './query'
import { findingSchema, inboxReturn } from './model'
import { exactItem, stageSuggestion } from './review'
import { acquireLock } from './lock'
import { launchAgent } from './schedule'
import { atomicJson, readJson, stateDirectory } from './files'

const roots: string[] = []
afterEach(async () => { await Promise.all(roots.splice(0).map(root => fs.rm(root, { recursive: true, force: true }))) })
async function fixture() { const root = await curationFixture(); roots.push(root); return root }
const query = (input = {}) => querySchema.parse(input)

test('provenance, place search, missing descriptions, coverage, and exact-field suggestions', async () => {
  const root = await fixture()
  await fixtureGallery(root, 'demo', {
    first: fixtureItem('1'), second: fixtureItem('1', 'Toronto, Ontario, Canada', '<search>best^</search><photo_desc>Existing</photo_desc>'),
    third: [1, 2, 3].map(id => fixtureItem(String(id), 'Toronto, Ontario, Canada', '<search>best^</search>')).join(''),
  })
  await fixtureGallery(root, 'other', { first: fixtureItem('1') })
  const source = await inventory(root, ['demo', 'other'])
  expect(source.errors).toEqual([])
  const analyzed = analyze(source, 'now')
  expect(analyzed.errors).toEqual([])
  const rows = [...analyzed.rows.values()].flat()
  const photo = rows.find(row => row.source.gallery === 'demo' && row.source.album === 'first' && row.scope === 'photo')!
  expect(photo.findings.map(finding => finding.category)).toEqual(['description', 'tags', 'location'])
  expect(photo.findings.find(finding => finding.category === 'location')?.suggestion?.proposed).toBe('Toronto, Ontario, Canada')
  expect(rows.find(row => row.scope === 'album' && row.source.album === 'second')?.findings[0].reason).toContain('Below-median')
  expect(new Set(rows.map(row => row.id)).size).toBe(rows.length)
  await runScan(root, 'full', { galleries: ['demo', 'other'] })
  const result = await getInbox(root, query({ place: 'old montreal' }))
  expect(result.galleries).toEqual(['demo', 'other'])
  expect(result.counts.photos).toBe(5)
  expect(result.rows.some(row => row.scope === 'album')).toBe(true)
  expect(findingSchema.safeParse({ id: '../bad' }).success).toBe(false)
  expect(inboxReturn('//evil.test')).toBe('/admin/curation')
})

test('unknown places, videos, unsupported countries, unavailable boundaries, and malformed sources', async () => {
  const root = await fixture()
  await fixtureGallery(root, 'demo', {
    first: '<item id="1"><filename>2020-video.mp4</filename><type>video</type></item>'
      + '<item id="2"><filename>2020-empty.jpg</filename><photo_desc>  </photo_desc></item>'
      + fixtureItem('3', 'Paris, France', '<photo_desc>Paris</photo_desc>'),
  })
  const data = await inventory(root, ['demo'])
  const rows = [...analyze(data, 'now').rows.values()].flat()
  expect(rows.some(row => row.scope === 'video')).toBe(false)
  expect(rows.find(row => row.source.itemId === '2')?.places).toEqual(['Unknown location'])
  expect(rows.find(row => row.source.itemId === '3')?.findings.some(finding => finding.category === 'location')).toBe(false)
  expect(rows.find(row => row.source.itemId === '2')?.findings.some(finding => finding.reason === 'Missing place')).toBe(true)
  await fixtureGallery(root, 'demo', { first: fixtureItem('1') })
  await fs.unlink(join(root, 'public/maps/visited/canada.geojson'))
  expect(analyze(await inventory(root, ['demo']), 'now').errors.join()).toContain('unavailable for Canada')
  await fs.writeFile(join(root, 'public/galleries/demo/first.xml'), '<broken>')
  expect((await inventory(root, ['demo'])).errors.join()).toContain('Unable to read valid album')
})

test('full and incremental agree; failures retain results and changed sources invalidate publication', async () => {
  const root = await fixture()
  await fixtureGallery(root, 'demo', { first: fixtureItem('1') })
  const path = join(root, 'public/galleries/demo/first.xml')
  const original = await fs.readFile(path, 'utf8')
  await runScan(root, 'full', { galleries: ['demo'] })
  expect(await fs.readFile(path, 'utf8')).toBe(original)
  const snapshot = await currentSnapshot(root)
  await runScan(root, 'incremental', { galleries: ['demo'], beforePublish: async () => { await fs.appendFile(path, '\n') } })
  expect((await scanStatus(root)).state).toBe('incomplete')
  expect(await currentSnapshot(root)).toEqual(snapshot)
  await runScan(root, 'incremental', { galleries: ['demo'] })
  const incremental = await getInbox(root, query())
  await runScan(root, 'full', { galleries: ['demo'] })
  const full = await getInbox(root, query())
  expect(incremental.rows.map(({ checkedAt: _, ...row }) => row)).toEqual(full.rows.map(({ checkedAt: _, ...row }) => row))
  await fs.unlink(path)
  await runScan(root, 'incremental', { galleries: ['demo'] })
  expect((await scanStatus(root)).state).toBe('incomplete')
  expect((await getInbox(root, query())).counts.findings).toBe(full.counts.findings)
  await fixtureGallery(root, 'demo', {})
  await runScan(root, 'incremental', { galleries: ['demo'] })
  expect((await getInbox(root, query())).rows).toEqual([])
})

test('review stages only exact source, rejects stale values, and resolves only on a fresh scan', async () => {
  const root = await fixture()
  await fixtureGallery(root, 'demo', { first: fixtureItem('1') })
  await runScan(root, 'full', { galleries: ['demo'] })
  const inbox = await getInbox(root, query({ category: 'location' }))
  const row = inbox.rows[0]
  const suggestion = row.findings[0].suggestion!
  const data = await inventory(root, ['demo'])
  const album = data.albums[0]
  const before = await fs.readFile(album.path, 'utf8')
  const staged = stageSuggestion(row, suggestion, album.items, album.revision, { ...album.items[0], photo_desc: 'Pending description' })
  expect(staged.photo_city).toBe('Toronto, Ontario, Canada')
  expect(staged.photo_desc).toBe('Pending description')
  expect(await fs.readFile(album.path, 'utf8')).toBe(before)
  expect(() => stageSuggestion(row, suggestion, album.items, 'changed')).toThrow('stale')
  expect(exactItem([album.items[0], album.items[0]], '1', row.source.filename)).toBeNull()
  expect(exactItem(album.items, 'missing', row.source.filename)).toBeNull()
  await fs.writeFile(album.path, before.replace('Ontaro', 'Ontario'))
  await markAwaiting(root, 'demo/first')
  expect((await getInbox(root, query({ category: 'location' }))).rows).toHaveLength(1)
  await runScan(root, 'incremental', { galleries: ['demo'] })
  const verified = await getInbox(root, query({ category: 'location' }))
  expect(verified.rows).toHaveLength(0)
  expect(verified.awaiting).toEqual([])
})

test('resumes checkpoints, coalesces full requests, and never steals a sleeping owner lock', async () => {
  const root = await fixture()
  await fixtureGallery(root, 'demo', { first: fixtureItem('1'), second: fixtureItem('2') })
  await runScan(root, 'full', { galleries: ['demo'], afterCheckpoint: async () => { throw new Error('Simulated interruption') } })
  expect((await scanStatus(root)).completed).toBe(1)
  await runScan(root, 'incremental', { galleries: ['demo'] })
  expect((await scanStatus(root)).state).toBe('complete')
  const path = join(stateDirectory(root), 'worker.lock')
  const release = await acquireLock(path)
  expect(release).toBeTruthy()
  const owner = await fs.readFile(path, 'utf8')
  await fs.utimes(path, new Date(0), new Date(0))
  expect(await acquireLock(path)).toBeNull()
  expect(await fs.readFile(path, 'utf8')).toBe(owner)
  await enqueue(root, 'incremental', 'demo/first')
  await enqueue(root, 'full')
  await enqueue(root, 'incremental', 'demo/second')
  expect(await readJson(join(stateDirectory(root), 'pending.json'))).toMatchObject({ mode: 'full', scopes: ['demo/first', 'demo/second'] })
  await release!()
  await runScan(root, 'incremental', { galleries: ['demo'] })
  expect((await scanStatus(root)).mode).toBe('full')
})

test('calendar schedule uses absolute escaped paths and weekly full due dates', () => {
  const plist = launchAgent('/tmp/History & Photos', '/usr/local/bin/node')
  expect(plist).toContain('StartCalendarInterval')
  expect(plist).toContain('History &amp; Photos')
  expect(plist).not.toContain('KeepAlive')
  expect(plist).not.toContain('caffeinate')
  expect(() => launchAgent('/tmp/project', '/bin/node', 60)).toThrow()
  expect(scheduledMode(null)).toBe('full')
  expect(scheduledMode({ version: 1, generation: 'x', completedAt: '', lastFullAt: new Date().toISOString(), tagsConfigured: false,
    shards: [] })).toBe('incremental')
})

test('rebuilds corrupt derived snapshots and checkpoints without altering source XML', async () => {
  const root = await fixture()
  await fixtureGallery(root, 'demo', { first: fixtureItem('1') })
  await runScan(root, 'full', { galleries: ['demo'] })
  const directory = stateDirectory(root)
  const files = await fs.readdir(join(directory, 'checkpoints'))
  await fs.writeFile(join(directory, 'checkpoints', files[0]), '{invalid')
  await fs.writeFile(join(directory, 'current.json'), '{invalid')
  await enqueue(root, 'incremental')
  await runScan(root, 'full', { galleries: ['demo'] })
  expect((await scanStatus(root)).state).toBe('complete')
  expect((await scanStatus(root)).mode).toBe('full')
  expect((await getInbox(root, query())).rows.length).toBeGreaterThan(0)
})

test('recovers dead owners including an interrupted lock recovery gate', async () => {
  const root = await fixture()
  const path = join(stateDirectory(root), 'worker.lock')
  const dead = { pid: 2147483647, start: 'dead', token: 'dead-owner' }
  await atomicJson(path, dead)
  await atomicJson(`${path}.recovery`, dead)
  const release = await acquireLock(path)
  expect(release).toBeTruthy()
  expect(await acquireLock(path)).toBeNull()
  await release!()
  expect(await readJson(path)).toBeNull()
})

test('incremental scans invalidate tag and boundary dependencies', async () => {
  const root = await fixture()
  await fixtureGallery(root, 'demo', { first: fixtureItem('1') })
  await runScan(root, 'full', { galleries: ['demo'] })
  await fs.writeFile(join(root, 'config.local.json'), JSON.stringify({ 'critical-tags': [] }))
  const boundariesPath = join(root, 'public/maps/visited/canada.geojson')
  const boundaries = JSON.parse(await fs.readFile(boundariesPath, 'utf8'))
  boundaries.features[0].properties.aliases.push('Ontaro')
  await fs.writeFile(boundariesPath, JSON.stringify(boundaries))
  await runScan(root, 'incremental', { galleries: ['demo'] })
  const incremental = await getInbox(root, query())
  expect(incremental.counts.findings).toBe(2)
  expect(incremental.snapshot?.tagsConfigured).toBe(false)
  await runScan(root, 'full', { galleries: ['demo'] })
  const full = await getInbox(root, query())
  expect(incremental.rows.map(({ checkedAt: _, ...row }) => row)).toEqual(full.rows.map(({ checkedAt: _, ...row }) => row))
})

test('prioritizes today across galleries before pagination and changes day without rescanning', async () => {
  const root = await fixture()
  const dated = (id: string, date: string, extra = '') => fixtureItem(id, 'Toronto, Ontario, Canada',
    `<photo_date>${date}</photo_date>${extra}`)
  await fixtureGallery(root, 'demo', {
    older: Array.from({ length: 35 }, (_, id) => dated(String(id), '2020-01-01')).join(''),
    today: dated('today', '1999-10-07'),
    tomorrow: dated('tomorrow', '2020-10-08'),
    clean: dated('clean', '2020-10-07', '<photo_desc>Complete description</photo_desc><search>best^</search>'),
    fallback: fixtureItem('fallback', 'Toronto, Ontario, Canada').replace('2020-photo-fallback.jpg', '2005-10-07-01.jpg'),
    override: dated('override', '2020-01-01').replace('2020-photo-override.jpg', '2005-10-07-01.jpg'),
    video: dated('video', '2020-10-07', '<type>video</type>'),
  })
  await fixtureGallery(root, 'other', { today: dated('today', '2010-10-07') })
  await runScan(root, 'full', { galleries: ['demo', 'other'] })
  const snapshot = await currentSnapshot(root)
  const now = new Date(2026, 9, 7, 12)
  const all = await getInbox(root, query(), now)
  expect(all.rows.slice(0, 3).map(row => row.monthDay)).toEqual(['10-07', '10-07', '10-07'])
  expect(all.today).toEqual({ monthDay: '10-07', photos: 3, findings: 6 })
  const today = await getInbox(root, query({ focus: 'today' }), now)
  expect(today.rows).toHaveLength(3)
  expect(today.counts.photos).toBe(3)
  expect(today.rows.every(row => row.scope === 'photo')).toBe(true)
  expect((await getInbox(root, query({ focus: 'today', gallery: 'other', category: 'tags' }), now)).today?.findings).toBe(1)
  const nextDay = await getInbox(root, query({ focus: 'today' }), new Date(2026, 9, 8, 12))
  expect(nextDay.rows.map(row => row.source.itemId)).toEqual(['tomorrow'])
  expect(await currentSnapshot(root)).toEqual(snapshot)
})
