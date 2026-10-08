import fs from 'node:fs/promises'
import { join } from 'node:path'
import { randomUUID } from 'node:crypto'
import { generatedGalleries } from '../../types/generated'
import { analyze, albumKey, detectorVersion } from './detectors'
import { inventory, verifyInventory } from './sources'
import { atomicJson, digest, readJson, stateDirectory } from './files'
import { acquireLock, lockAlive } from './lock'
import { rowSchema, snapshotSchema, type CurationRow, type RunStatus, type ScanMode, type Snapshot } from './model'

type RequestQueue = { mode: 'incremental' | 'full', id: string, scopes: string[] }
type Shard = { fingerprint: string, rows: CurationRow[] }
const emptyStatus: RunStatus = { state: 'not-scanned', completed: 0, total: 0, errors: [] }

export async function currentSnapshot(root: string) {
  try {
    const parsed = snapshotSchema.safeParse(await readJson<unknown>(join(stateDirectory(root), 'current.json')))
    return parsed.success ? parsed.data : null
  } catch (error) {
    if (error instanceof SyntaxError) return null
    throw error
  }
}

async function readCheckpoint(path: string): Promise<Shard | null> {
  try {
    const checkpoint = await readJson<Shard>(path)
    if (!checkpoint || typeof checkpoint.fingerprint !== 'string' || !Array.isArray(checkpoint.rows)) return null
    const parsed = checkpoint.rows.map(row => rowSchema.safeParse(row))
    return parsed.every(row => row.success) ? { fingerprint: checkpoint.fingerprint, rows: parsed.map(row => row.data!) } : null
  } catch (error) {
    if (error instanceof SyntaxError) return null
    throw error
  }
}

export async function scanStatus(root: string): Promise<RunStatus> {
  const directory = stateDirectory(root)
  const value = await readJson<RunStatus>(join(directory, 'status.json')) ?? emptyStatus
  if (value.state === 'running' && !(await lockAlive(join(directory, 'worker.lock')))) {
    return { ...value, state: 'incomplete', errors: [...value.errors, 'Scan interrupted. Run again to resume completed checkpoints.'] }
  }
  return value
}

export function scheduledMode(snapshot: Snapshot | null, now = Date.now()): 'incremental' | 'full' {
  return snapshot?.lastFullAt && now - Date.parse(snapshot.lastFullAt) < 7 * 86400000 ? 'incremental' : 'full'
}

async function queueLock(root: string) {
  const path = join(stateDirectory(root), 'queue.lock')
  for (let retry = 0; retry < 100; retry++) {
    const release = await acquireLock(path)
    if (release) return release
    await new Promise(resolve => setTimeout(resolve, 20))
  }
  throw new Error('Scan request queue is busy; retry shortly')
}

export async function enqueue(root: string, mode: 'incremental' | 'full', scope?: string) {
  const release = await queueLock(root)
  try {
    const path = join(stateDirectory(root), 'pending.json')
    const existing = await readJson<RequestQueue>(path)
    const request: RequestQueue = {
      mode: existing?.mode === 'full' || mode === 'full' ? 'full' : 'incremental',
      id: existing?.id ?? randomUUID(), scopes: [...new Set([...(existing?.scopes ?? []), ...(scope ? [scope] : [])])],
    }
    await atomicJson(path, request)
    return request.id
  } finally { await release() }
}

async function takeRequest(root: string) {
  const release = await queueLock(root)
  try {
    const path = join(stateDirectory(root), 'pending.json')
    const request = await readJson<RequestQueue>(path)
    if (request) await fs.unlink(path)
    return request
  } finally { await release() }
}

export async function markAwaiting(root: string, scope: string) {
  const release = await queueLock(root)
  try {
    const path = join(stateDirectory(root), 'awaiting.json')
    const pending = await readJson<Record<string, string>>(path) ?? {}
    pending[scope] = new Date().toISOString()
    await atomicJson(path, pending)
  } finally { await release() }
}

export async function readShard(root: string, snapshot: Snapshot, name: string) {
  if (!/^[a-f0-9]{64}$/.test(name) || !/^[a-f0-9-]+$/.test(snapshot.generation)) throw new Error('Invalid snapshot')
  const shard = await readJson<Shard>(join(stateDirectory(root), 'generations', snapshot.generation, `${name}.json`))
  if (!shard) throw new Error('Snapshot shard unavailable; run a full scan')
  return { ...shard, rows: shard.rows.map(row => rowSchema.parse(row)) }
}

export async function runScan(root: string, mode: ScanMode = 'incremental', options: {
  galleries?: readonly string[], beforePublish?: () => Promise<void>, afterCheckpoint?: (count: number) => Promise<void>,
} = {}): Promise<{ queued: boolean, runId: string }> {
  const directory = stateDirectory(root)
  const release = await acquireLock(join(directory, 'worker.lock'))
  if (!release) {
    const requestedMode = mode === 'scheduled' ? scheduledMode(await currentSnapshot(root)) : mode
    return { queued: true, runId: await enqueue(root, requestedMode) }
  }
  let initial: RequestQueue | null
  let interrupted: RunStatus | null
  try {
    initial = await takeRequest(root)
    interrupted = await readJson<RunStatus>(join(directory, 'status.json'))
  } catch (error) { await release(); throw error }
  let request: RequestQueue | null = initial ?? {
    mode: mode === 'full' ? 'full' : 'incremental', id: randomUUID(), scopes: [],
  }
  let lastRunId = request.id
  let forceFull = mode === 'full'
  try {
    do {
      const previous = await currentSnapshot(root)
      const selected = forceFull || request.mode === 'full' ? 'full' : mode === 'scheduled' ? scheduledMode(previous) : request.mode
      forceFull = false
      const startedAt = new Date().toISOString()
      const status: RunStatus = {
        state: 'running', mode: selected, runId: request.id, startedAt, completed: 0, total: 0, errors: [],
      }
      lastRunId = request.id
      await atomicJson(join(directory, 'status.json'), status)
      try {
        const data = await inventory(root, options.galleries ?? generatedGalleries)
        status.total = data.albums.length
        const sharedVersions = Object.fromEntries(Object.entries(data.versions).filter(([path]) => !path.endsWith('.xml')))
        const counts = data.albums.map(album => album.items.filter(item => (item.search ?? '').split(',')
          .some(tag => data.tags.some(critical => critical.trim().toLowerCase() === tag.trim().toLowerCase()))).length)
        const fingerprints = new Map(data.albums.map(album => [albumKey(album), digest(JSON.stringify([
          detectorVersion, sharedVersions, data.tags, counts,
          data.albums.filter(source => source.gallery === album.gallery).map(source => [source.album, source.revision]),
        ]))]))
        const reusable = new Map<string, Shard>()
        for (const album of data.albums) {
          const key = albumKey(album)
          const checkpoint = await readCheckpoint(join(directory, 'checkpoints', `${digest(key)}.json`))
          const resuming = interrupted?.state === 'incomplete' || interrupted?.state === 'running'
          if ((selected !== 'full' || resuming) && !request.scopes.includes(key)
            && checkpoint && checkpoint.fingerprint === fingerprints.get(key)) {
            reusable.set(key, { ...checkpoint, rows: checkpoint.rows.map(row => rowSchema.parse(row)) })
          }
        }
        const missing = new Set(data.albums.map(albumKey).filter(key => !reusable.has(key)))
        const analysis = analyze(data, startedAt, missing)
        if (analysis.errors.length) throw new Error(analysis.errors.join('\n'))
        const generation = request.id
        const staging = join(directory, 'generations', generation)
        await fs.mkdir(staging, { recursive: true, mode: 0o700 })
        const shards: string[] = []
        for (const album of data.albums) {
          const key = albumKey(album)
          const name = digest(key)
          const checkpointPath = join(directory, 'checkpoints', `${name}.json`)
          const shard = reusable.get(key) ?? { fingerprint: fingerprints.get(key)!, rows: analysis.rows.get(key) ?? [] }
          await atomicJson(checkpointPath, shard)
          await atomicJson(join(staging, `${name}.json`), shard)
          shards.push(name)
          status.completed++
          await atomicJson(join(directory, 'status.json'), status)
          await options.afterCheckpoint?.(status.completed)
        }
        await options.beforePublish?.()
        if (!(await verifyInventory(root, data.versions))) throw new Error('Sources changed during analysis; run again to verify them.')
        const completedAt = new Date().toISOString()
        const snapshot: Snapshot = {
          version: 1, generation, completedAt, lastFullAt: selected === 'full' ? completedAt : previous?.lastFullAt,
          tagsConfigured: data.tags.length > 0, shards,
        }
        await atomicJson(join(directory, 'current.json'), snapshot)
        const unlockQueue = await queueLock(root)
        try {
          const awaitingPath = join(directory, 'awaiting.json')
          const awaiting = await readJson<Record<string, string>>(awaitingPath) ?? {}
          await atomicJson(awaitingPath, Object.fromEntries(Object.entries(awaiting).filter(([, time]) => time > startedAt)))
        } finally { await unlockQueue() }
        await atomicJson(join(directory, 'status.json'), { ...status, state: 'complete', finishedAt: completedAt })
        // Only derived generations are removed; keep the current and preceding published snapshots.
        for (const name of await fs.readdir(join(directory, 'generations'))) {
          if (name !== generation && name !== previous?.generation && /^[a-f0-9-]+$/.test(name)) {
            await fs.rm(join(directory, 'generations', name), { recursive: true, force: true })
          }
        }
        for (const file of await fs.readdir(join(directory, 'checkpoints')).catch(() => [])) {
          if (/^[a-f0-9]{64}\.json$/.test(file) && !shards.includes(file.slice(0, -5))) {
            await fs.unlink(join(directory, 'checkpoints', file))
          }
        }
      } catch (error) {
        await atomicJson(join(directory, 'status.json'), {
          ...status, state: 'incomplete', finishedAt: new Date().toISOString(), errors: [String(error)],
        })
      }
      request = await takeRequest(root)
    } while (request)
  } finally { await release() }
  if (await readJson<RequestQueue>(join(directory, 'pending.json'))) return runScan(root, 'incremental', options)
  return { queued: false, runId: lastRunId }
}
