import { mkdir, rm } from 'node:fs/promises'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, test } from 'vitest'
import sharp from 'sharp'

import config from '../../models/config'
import { saveThumbnail } from '../thumbnail-framing'

const fixtureRoot = path.join(process.cwd(), 'public/test/fixtures/thumbnail-framing')
const originalsPath = path.join(fixtureRoot, 'originals')
const photosPath = path.join(fixtureRoot, 'photos')
const thumbsPath = path.join(fixtureRoot, 'thumbs')
const filename = 'sample.jpg'

describe('saveThumbnail', () => {
  beforeEach(async () => {
    await mkdir(originalsPath, { recursive: true })
    await mkdir(photosPath, { recursive: true })
    await sharp({
      create: { width: 1200, height: 600, channels: 3, background: '#d22' },
    }).jpeg().toFile(path.join(photosPath, filename))
  })

  afterEach(async () => {
    await rm(fixtureRoot, { recursive: true, force: true })
  })

  test('writes a cropped, compressed thumbnail alongside the resized photos', async () => {
    const result = await saveThumbnail({
      sourceFolder: originalsPath,
      filename,
      zoom: 2,
      positionX: 1,
      positionY: 0,
    })

    expect(result.filename).toBe(filename)
    expect(result.crop).toEqual({ left: 600, top: 0, width: 600, height: 146 })

    const metadata = await sharp(path.join(thumbsPath, filename)).metadata()
    expect(metadata.format).toBe('jpeg')
    expect(metadata.width).toBe(config.resizeDimensions.thumb.width)
    expect(metadata.height).toBe(config.resizeDimensions.thumb.height)
  })

  test('rejects a filename that attempts to include a path', async () => {
    await expect(saveThumbnail({
      sourceFolder: originalsPath,
      filename: '../sample.jpg',
      zoom: 1,
      positionX: 0.5,
      positionY: 0.5,
    })).rejects.toThrow('Filename must not include a path')
  })

  test('rejects a source folder outside the public directory', async () => {
    await expect(saveThumbnail({
      sourceFolder: '../',
      filename,
      zoom: 1,
      positionX: 0.5,
      positionY: 0.5,
    })).rejects.toThrow('Restrict to public file system')
  })
})
