import { mkdtemp, mkdir, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, test } from 'vitest'

import { galleryTypeDefinition, generateGalleryTypes } from './generate-gallery-types'

const temporaryDirectories: string[] = []

afterEach(async () => {
  await Promise.all(temporaryDirectories.splice(0).map(directory => rm(directory, { force: true, recursive: true })))
})

describe('generate gallery types', () => {
  test('bootstraps from gallery directories without a pre-existing generated type file', async () => {
    const temporaryDirectory = await mkdtemp(join(tmpdir(), 'history-generate-types-'))
    temporaryDirectories.push(temporaryDirectory)
    const galleriesDirectory = join(temporaryDirectory, 'public', 'galleries')
    const outputPath = join(temporaryDirectory, 'src', 'types', 'generated.ts')
    await Promise.all([
      mkdir(join(galleriesDirectory, 'demo'), { recursive: true }),
      mkdir(join(galleriesDirectory, 'dan'), { recursive: true }),
      mkdir(join(outputPath, '..'), { recursive: true }),
    ])

    await generateGalleryTypes({ galleriesDirectory, outputPath })

    await expect(readFile(outputPath, 'utf-8')).resolves.toBe(galleryTypeDefinition(['dan', 'demo']))
  })

  test('rejects an empty gallery directory', () => {
    expect(() => galleryTypeDefinition([])).toThrow('No galleries found')
  })
})
