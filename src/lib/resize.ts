import { readdir } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

import config from '../../config.json'
import pathExists from './exists'
import utilsFactory, { isStandardError } from './utils'

const utils = utilsFactory()

export function errorSchema(msg: string) {
  return msg
}

/**
 * Resize a JPEG image into photo and thumbnail versions.
 * @param {string} sourceFolder - Path to original image (must be in "originals" folder)
 * @returns {Promise<object>} - Resize result with paths and any errors
 */
export async function resize({ sourceFolder }: { sourceFolder: string }) {
  let originalPath

  try {
    originalPath = await pathExists(sourceFolder)
  } catch (err) {
    if (isStandardError(err)) {
      throw new Error(`Invalid path: ${err.message}`)
    } else {
      throw new Error('Invalid path: Unknown error occurred')
    }
  }

  if (!originalPath.includes('originals')) {
    throw new Error('Source folder must be in the "originals" folder with "photos" and "thumbs" as sibling folders')
  }

  const errors = []

  try {
    const filesOnDisk = await readdir(originalPath)
    const jpgs = filesOnDisk.filter(f =>
      config.supportedFileTypes.photo.some(ext => f.toLocaleLowerCase().includes(ext))
    )

    const photoDims = config.resizeDimensions.photo
    const thumbDims = config.resizeDimensions.thumb

    const photoPath = originalPath.replace('originals', 'photos')
    const thumbPath = originalPath.replace('originals', 'thumbs')

    for (const jpg of jpgs) {
      let buffer
      try {
        buffer = await sharp(path.join(originalPath, jpg)).rotate().toBuffer()
      } catch (error) {
        errors.push(`Error processing ${jpg}:`, error)
      }

      // Create photo
      try {
        await sharp(buffer)
          .resize(photoDims.width, photoDims.height, { fit: 'inside' })
          .toFile(path.join(photoPath, jpg))
      } catch (err) {
        if (isStandardError(err)) {
          errors.push(`Resize photo: ${err.message}`)
        } else {
          errors.push('Resize photo: Unknown error occurred')
        }
      }

      // Create thumbnail
      try {
        await sharp(buffer)
          .resize(thumbDims.width, thumbDims.height, { fit: 'fill' })
          .toFile(path.join(thumbPath, jpg))
      } catch (err) {
        if (isStandardError(err)) {
          errors.push(`Resize thumbnail: ${err.message}`)
        } else {
          errors.push('Resize thumbnail: Unknown error occurred')
        }
      }
    }

    return {
      meta: {
        error: {
          count: errors.length,
          message: errors,
        },
      },
      payload: {
        paths: {
          original: originalPath,
          photo: photoPath,
          thumb: thumbPath,
        },
      },
    }

  } catch (err) {
    if (isStandardError(err)) {
      errors.push(`Resize failed: ${err.message}`)
    } else {
      errors.push('Resize failed: Unknown error occurred')
    }
  }
}
