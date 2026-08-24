import type { Dirent } from 'node:fs'
import fs from 'node:fs/promises'
import { afterEach, describe, expect, test, vi } from 'vitest'

import getGalleries from '../galleries'

function directory(name: string): Dirent {
  return { name, isDirectory: () => true } as Dirent
}

function file(name: string): Dirent {
  return { name, isDirectory: () => false } as Dirent
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('galleries library', () => {
  test('returns only generated galleries that are currently present on disk', async () => {
    vi.spyOn(fs, 'readdir').mockResolvedValue(([
      directory('demo'),
      directory('new-gallery'),
      file('README.md'),
    ] as unknown) as Awaited<ReturnType<typeof fs.readdir>>)

    await expect(getGalleries()).resolves.toEqual({
      galleries: ['demo'],
    })
  })
})
