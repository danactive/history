import { readdir } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

import config from '../models/config'
import pathExists from './exists'
import utilsFactory, { isStandardError } from './utils'
import { validateRequestBody, type RequestSchema } from '../models/resize'

const utils = utilsFactory()

function errorSchema(msg: string) {
  return msg
}

type ResizeOutput = {
  filename: string
  type: 'photo' | 'thumb'
  width?: number
  height?: number
}

type ResponseBody = {
  meta: {
    error: {
      count: number
      message: string[]
    }
  }
  payload: {
    paths: {
      original: string
      photo: string
      thumb: string
    }
    files: ResizeOutput[]
  } | null
}

function formatErrorMessage(err: unknown, prefix: string): string {
  if (isStandardError(err)) {
    return `${prefix}: ${err.message}`
  }
  return `${prefix}: Unknown error occurred`
}

/**
 * Resize a JPEG image into photo and thumbnail versions.
 * @param {object} params - Resize options
 * @param {boolean} params.metadata - Response output with image dimension
 * @param {string} params.sourceFolder - Path to original image (must be in "originals" folder)
 * @returns {Promise<object>} - Resize result with paths and any errors
 */
async function resize({ sourceFolder, metadata }: ReturnType<typeof validateRequestBody>): Promise<ResponseBody> {
  let originalPath: string

  try {
    originalPath = await pathExists(sourceFolder)
  } catch (err) {
    throw new Error(formatErrorMessage(err, 'Invalid path'))
  }

  if (!originalPath.includes('originals')) {
    throw new Error('Source folder must be in the "originals" folder with "photos" and "thumbs" as sibling folders')
  }

  const errors: string[] = []
  const outFiles: ResizeOutput[] = []

  try {
    const filesOnDisk = await readdir(originalPath)

    const jpgs = filesOnDisk.filter(file =>
      config.supportedFileTypes.photo.includes(path.extname(file).toLowerCase().substring(1)),
    )

    const photoDims = config.resizeDimensions.photo
    const thumbDims = config.resizeDimensions.thumb

    const baseDir = path.dirname(originalPath)
    const photoPath = path.join(baseDir, 'photos')
    const thumbPath = path.join(baseDir, 'thumbs')


    for (const jpg of jpgs) {
      const inputPath = path.join(originalPath, jpg)
      let buffer: Buffer | undefined

      try {
        buffer = await sharp(inputPath).rotate().toBuffer()
      } catch (err) {
        errors.push(formatErrorMessage(err, `Error processing original ${jpg}`))
        continue
      }

      if (!buffer) continue

      // Process Photo
      const photoOutputPath = path.join(photoPath, jpg)
      try {
        await sharp(buffer)
          .resize(photoDims.width, photoDims.height, { fit: 'inside' })
          .toFile(photoOutputPath)

        if (metadata) {
          const { width, height } = await sharp(photoOutputPath).metadata()
          outFiles.push({ filename: jpg, type: 'photo', width, height })
        }
      } catch (err) {
        errors.push(formatErrorMessage(err, `Resize photo: ${jpg}`))
      }

      // Process Thumbnail
      const thumbOutputPath = path.join(thumbPath, jpg)
      try {
        await sharp(buffer)
          .resize(thumbDims.width, thumbDims.height, { fit: 'fill' })
          .toFile(thumbOutputPath)

        if (metadata) {
          const { width, height } = await sharp(thumbOutputPath).metadata()
          outFiles.push({ filename: jpg, type: 'thumb', width, height })
        }
      } catch (err) {
        errors.push(formatErrorMessage(err, `Resize thumbnail: ${jpg}`))
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
        files: outFiles,
      },
    }

  } catch (err) {
    errors.push(formatErrorMessage(err, 'Resize failed'))
    return {
      meta: {
        error: {
          count: errors.length,
          message: errors,
        },
      },
      payload: null,
    }
  }
}

export {
  errorSchema,
  resize,
  type ResponseBody as ResizeResponseBody,
  type RequestSchema as ResizeRequestBody,
}
