// @vitest-environment node
import { EventEmitter } from 'node:events'
import fs from 'node:fs/promises'
import { join } from 'node:path'
import { afterEach, expect, test, vi } from 'vitest'
import { curationFixture } from './fixtures'
import { startWorker } from './worker'
import { scanStatus } from './engine'

const mocks = vi.hoisted(() => ({ spawn: vi.fn() }))
vi.mock('node:child_process', async importOriginal => ({
  ...await importOriginal<typeof import('node:child_process')>(), spawn: mocks.spawn,
}))
const roots: string[] = []
afterEach(async () => {
  await Promise.all(roots.splice(0).map(root => fs.rm(root, { recursive: true, force: true })))
  vi.clearAllMocks()
})

test('missing runner reports a startup failure without launching a process', async () => {
  const root = await curationFixture(); roots.push(root)
  await expect(startWorker(root, 'full')).rejects.toThrow()
  expect(mocks.spawn).not.toHaveBeenCalled()
  expect((await scanStatus(root)).state).toBe('failed')
})

test('returns on spawn with fixed detached arguments and reports an early boot failure', async () => {
  const root = await curationFixture(); roots.push(root)
  await fs.mkdir(join(root, 'node_modules/tsx/dist'), { recursive: true })
  await fs.mkdir(join(root, 'scripts'))
  await fs.writeFile(join(root, 'node_modules/tsx/dist/cli.mjs'), '')
  await fs.writeFile(join(root, 'scripts/curation-scan.ts'), '')
  const child = Object.assign(new EventEmitter(), { unref: vi.fn() })
  mocks.spawn.mockImplementation(() => { queueMicrotask(() => child.emit('spawn')); return child })
  const id = await startWorker(root, 'incremental', 'demo/sample')
  expect(mocks.spawn).toHaveBeenCalledWith(process.execPath,
    [join(root, 'node_modules/tsx/dist/cli.mjs'), join(root, 'scripts/curation-scan.ts'), '--consume'],
    expect.objectContaining({ cwd: root, detached: true, stdio: 'ignore' }))
  expect(child.unref).toHaveBeenCalledOnce()
  child.emit('exit', 1, null)
  await vi.waitFor(async () => expect(await scanStatus(root)).toMatchObject({ state: 'failed', runId: id }))
})
