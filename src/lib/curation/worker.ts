import { spawn } from 'node:child_process'
import fs from 'node:fs/promises'
import { join } from 'node:path'
import { enqueue } from './engine'
import { atomicJson, readJson, stateDirectory } from './files'
import { acquireLock } from './lock'
import type { RunStatus } from './model'

async function recordStartupFailure(root: string, id: string, error: unknown) {
  const directory = stateDirectory(root)
  const release = await acquireLock(join(directory, 'worker.lock'))
  if (!release) return // Another worker is already consuming the shared queue.
  try {
    const status = await readJson<RunStatus>(join(directory, 'status.json'))
    if (status?.runId === id) return // Preserve the scanner's more specific diagnostic.
    const pending = await readJson<{ id: string }>(join(directory, 'pending.json'))
    if (pending?.id !== id) return
    await atomicJson(join(directory, 'status.json'), {
      state: 'failed', runId: id, completed: 0, total: 0, errors: [`Unable to start scanner: ${String(error)}`],
    })
  } finally { await release() }
}

export async function startWorker(root: string, mode: 'incremental' | 'full', scope?: string) {
  const id = await enqueue(root, mode, scope)
  try {
    const runner = join(root, 'node_modules', 'tsx', 'dist', 'cli.mjs')
    const script = join(root, 'scripts', 'curation-scan.ts')
    await Promise.all([fs.access(runner), fs.access(script), fs.access(process.execPath)])
    await new Promise<void>((resolve, reject) => {
      const child = spawn(process.execPath, [runner, script, '--consume'], {
        cwd: root, detached: true, stdio: 'ignore', env: process.env,
      })
      child.once('error', reject)
      child.once('exit', (code, signal) => {
        if (code !== 0) void recordStartupFailure(root, id, signal ?? `process exited with code ${code}`).catch(() => {})
      })
      child.once('spawn', () => { child.unref(); resolve() })
    })
    return id
  } catch (error) {
    await recordStartupFailure(root, id, error)
    throw error
  }
}
