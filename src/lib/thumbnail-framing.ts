import { access, constants, mkdir } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

import config from '../models/config'
import { getThumbnailCrop, type ThumbnailCrop } from '../utils/thumbnail-crop'
import pathExists from './exists'

type SaveThumbnailOptions = {
  sourceFolder: string
  filename: string
  zoom: number
  positionX: number
  positionY: number
}

export type SaveThumbnailResult = {
  filename: string
  crop: ThumbnailCrop
}

function assertFilename(filename: string) {
  if (filename !== path.basename(filename) || /[\\/]/.test(filename)) {
    throw new Error('Filename must not include a path')
  }
  if (!config.supportedFileTypes.photo.includes(path.extname(filename).slice(1).toLowerCase())) {
    throw new Error('Thumbnail source must be a supported photo')
  }
}

function getMediaFolders(originalsPath: string) {
  if (path.basename(originalsPath) !== 'originals') {
    throw new Error('Source folder must be an "originals" folder')
  }

  const mediaPath = path.dirname(originalsPath)
  return {
    photoPath: path.join(mediaPath, 'photos'),
    thumbPath: path.join(mediaPath, 'thumbs'),
  }
}

/**
 * Save one manually framed JPEG thumbnail from the resized photo produced by
 * the existing Walk resize job.
 */
async function saveThumbnail({
  sourceFolder,
  filename,
  zoom,
  positionX,
  positionY,
}: SaveThumbnailOptions): Promise<SaveThumbnailResult> {
  assertFilename(filename)
  const originalsPath = await pathExists(sourceFolder)
  const { photoPath, thumbPath } = getMediaFolders(originalsPath)
  const sourcePath = path.join(photoPath, filename)

  try {
    await access(sourcePath, constants.R_OK)
  } catch {
    throw new Error(`Resized photo not found: ${filename}`)
  }

  const normalized = await sharp(sourcePath).rotate().toBuffer()
  const metadata = await sharp(normalized).metadata()
  if (!metadata.width || !metadata.height) {
    throw new Error(`Could not read dimensions for ${filename}`)
  }

  const target = config.resizeDimensions.thumb
  const crop = getThumbnailCrop({
    sourceWidth: metadata.width,
    sourceHeight: metadata.height,
    targetWidth: target.width,
    targetHeight: target.height,
    zoom,
    positionX,
    positionY,
  })

  await mkdir(thumbPath, { recursive: true })
  await sharp(normalized)
    .extract(crop)
    .resize(target.width, target.height, { kernel: sharp.kernel.lanczos3 })
    .jpeg({ quality: 75, chromaSubsampling: '4:2:0', mozjpeg: true })
    .toFile(path.join(thumbPath, filename))

  return { filename, crop }
}

export { saveThumbnail, type SaveThumbnailOptions }
