import fs from 'node:fs/promises'
import { execFileSync } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import { dirname } from 'node:path'
import { atomicJson, readJson } from './files'

type Owner = { pid: number, start: string, token: string }
function processStart(pid: number) {
  try {
    return execFileSync('/bin/ps', ['-p', String(pid), '-o', 'lstart='], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim()
  }
  catch { return '' }
}
function alive(owner: Owner) {
  try { process.kill(owner.pid, 0) } catch (error) {
    return (error as NodeJS.ErrnoException).code !== 'ESRCH'
  }
  const start = processStart(owner.pid)
  return !start || !owner.start || start === owner.start
}

export async function acquireLock(path: string): Promise<(() => Promise<void>) | null> {
  await fs.mkdir(dirname(path), { recursive: true, mode: 0o700 })
  const owner: Owner = { pid: process.pid, start: processStart(process.pid), token: randomUUID() }
  const candidate = `${path}.${owner.token}`
  await atomicJson(candidate, owner)
  try {
    // The recovery gate prevents a stale-lock reclaimer from removing a new owner.
    const gate = await readJson<Owner>(`${path}.recovery`)
    if (gate) {
      if (alive(gate)) return null
      const releaseGate = await acquireLock(`${path}.recovery`)
      if (!releaseGate) return null
      await releaseGate()
    }
    try { await fs.link(candidate, path) } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'EEXIST') throw error
      const previous = await readJson<Owner>(path)
      if (!previous || alive(previous)) return null
      const releaseGate = await acquireLock(`${path}.recovery`)
      if (!releaseGate) return null
      try {
        const current = await readJson<Owner>(path)
        if (!current || current.token !== previous.token || alive(current)) return null
        await fs.unlink(path)
        try { await fs.link(candidate, path) } catch (error) {
          if ((error as NodeJS.ErrnoException).code === 'EEXIST') return null
          throw error
        }
      } finally { await releaseGate() }
    }
    return async () => {
      if ((await readJson<Owner>(path))?.token === owner.token) await fs.unlink(path)
    }
  } finally { await fs.rm(candidate, { force: true }) }
}

export async function lockAlive(path: string) {
  const owner = await readJson<Owner>(path)
  return owner ? alive(owner) : false
}
