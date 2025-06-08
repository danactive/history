import { access, constants, mkdir, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import sharp from 'sharp'

import config from '../../../config.json' assert { type: 'json' }
import { resize } from '../resize'
import utilsFactory from '../utils'

const utils = utilsFactory()
const resizableFolder = utils.safePublicPath('/test/fixtures/resizable')
const originalsFolder = join(resizableFolder, 'originals')
const photosFolderPath = join(resizableFolder, 'photos')
const thumbsFolderPath = join(resizableFolder, 'thumbs')

const filename = '2016-07-12.jpg'
const badFilename = 'broken.jpg'
const photoFilePath = join(photosFolderPath, filename)
const thumbFilePath = join(thumbsFolderPath, filename)
const brokenFilePath = join(originalsFolder, badFilename)

describe('resize()', () => {
  afterEach(async () => {
    // Remove generated photo, thumb, and corrupt file if present
    await Promise.all([
      rm(photoFilePath, { force: true }),
      rm(thumbFilePath, { force: true }),
      rm(brokenFilePath, { force: true }),
    ])

    // Verify the photo and thumb files were deleted
    for (const file of [photoFilePath, thumbFilePath]) {
      try {
        await access(file, constants.F_OK)
        throw new Error(`Expected ${file} to be deleted, but it still exists`)
      } catch (err) {
        if (
          err &&
          typeof err === 'object' &&
          'code' in err &&
          (err as NodeJS.ErrnoException).code === 'ENOENT'
        ) {
          // Expected error, file does not exist
        } else {
          throw err
        }
      }
    }
  })

  it('resizes JPEG into photos and thumbs', async () => {
    const result = await resize({ sourceFolder: originalsFolder, metadata: true })

    expect(result.meta.error.count).toBe(0)

    const photoMeta = await sharp(photoFilePath).metadata()
    const thumbMeta = await sharp(thumbFilePath).metadata()

    expect(photoMeta.width).toBeLessThanOrEqual(config.resizeDimensions.photo.width)
    expect(photoMeta.height).toBeLessThanOrEqual(config.resizeDimensions.photo.height)
    expect(thumbMeta.width).toEqual(config.resizeDimensions.thumb.width)
    expect(thumbMeta.height).toEqual(config.resizeDimensions.thumb.height)
  })

  it('throws error if source is not in "originals"', async () => {
    const invalidPath = join(resizableFolder, 'badfolder')
    await mkdir(invalidPath, { recursive: true })

    await expect(resize({ sourceFolder: invalidPath, metadata: true }))
      .rejects.toThrow(/must be in the "originals" folder/)
  })

  it('throws error if source path does not exist', async () => {
    const missingPath = join(resizableFolder, 'doesnotexist')

    await expect(resize({ sourceFolder: missingPath, metadata: true }))
      .rejects.toThrow(/Invalid path/)
  })

  it('reports errors on corrupt file', async () => {
    await writeFile(brokenFilePath, Buffer.from([0, 1, 2, 3]))

    const result = await resize({ sourceFolder: originalsFolder, metadata: true })

    expect(result.meta.error.count).toBeGreaterThan(0)
    expect(result.meta.error.message.some(m => m.includes('Error processing'))).toBe(true)
  })
})
