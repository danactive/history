import { createHash, randomUUID } from 'node:crypto'
import { dirname, join } from 'node:path'
import fs from 'node:fs/promises'

export const digest = (value: string) => createHash('sha256').update(value).digest('hex')
export const stateDirectory = (root: string) => join(root, '.history', 'curation')
export const isMissing = (error: unknown) => (error as NodeJS.ErrnoException)?.code === 'ENOENT'

export async function readJson<T>(path: string): Promise<T | null> {
  try { return JSON.parse(await fs.readFile(path, 'utf8')) as T } catch (error) {
    if (isMissing(error)) return null
    throw error
  }
}

export async function atomicJson(path: string, value: unknown) {
  await fs.mkdir(dirname(path), { recursive: true, mode: 0o700 })
  const temporary = `${path}.${randomUUID()}.tmp`
  try {
    await fs.writeFile(temporary, JSON.stringify(value), { mode: 0o600 })
    await fs.rename(temporary, path)
  } finally { await fs.rm(temporary, { force: true }) }
}
