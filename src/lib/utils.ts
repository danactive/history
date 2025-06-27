import { glob as globNpm } from 'glob'
import mime from 'mime-types'
import path from 'node:path'
import { z } from 'zod/v4-mini'

import configFile from '../models/config'
import type {
  Gallery,
  Item,
  XmlItem,
} from '../types/common'
import { type Filesystem } from './filesystems'

const type = (filepath: string): string => {
  if (filepath.lastIndexOf('.') === 0) {
    return path.parse(filepath).name.substring(1)
  }

  return path.extname(filepath).substring(1)
}

const filenameAsJpg = (filename: Item['filename'][0]) => {
  const currentExt = type(filename)
  const futureExt = (currentExt.toLowerCase() === 'jpg' || currentExt.toLowerCase() === 'jpeg') ? currentExt : 'jpg'
  const imageFilename = filename.replace(currentExt, futureExt)
  return imageFilename
}

/**
 * Photo or thumbnail path to public folder on local filesystem
 * @param {object} filename file plus extension
 * @param {string} gallery name
 * @param {string} rasterType photo|thumb
 * @returns {string} path
 */
const rasterPath = (filename: XmlItem['filename'], gallery: Gallery, rasterType: 'photo' | 'thumb') => {
  const imageFilename = filenameAsJpg(Array.isArray(filename) ? filename[0] : filename)
  const year = imageFilename.indexOf('-') >= 0 && imageFilename.split('-')[0]

  return `/galleries/${gallery}/media/${rasterType}s/${year}/${imageFilename}`
}

/**
 * Video paths to public folder on local filesystem
 * @param {object} filename file plus extension
 * @param {string} gallery name
 * @returns {string[]} path
 */
const getVideoPaths = (filename: XmlItem['filename'], gallery: Gallery) => {
  const filenames = Array.isArray(filename) ? filename : [filename]
  return filenames.map((f) => {
    const year = f.indexOf('-') >= 0 && f.split('-')[0]
    return `/galleries/${gallery}/media/videos/${year}/${f}`
  })
}

function customMime(rawExtension: string) {
  const extension = (rawExtension) ? rawExtension.toLowerCase() : ''

  if (['raw', 'arw'].includes(extension)) {
    return 'image/raw'
  }

  if (['m2ts', 'mts'].includes(extension)) {
    return 'video/mp2t'
  }

  const photoTypes = configFile.supportedFileTypes.photo.concat(configFile.rawFileTypes.photo)
  if (photoTypes.includes(extension)) {
    return 'image'
  }

  const videoTypes = configFile.supportedFileTypes.video.concat(configFile.rawFileTypes.video)
  if (videoTypes.includes(extension)) {
    return 'video'
  }

  return null
}

function isStandardError(error: unknown): error is Error {
  if (error instanceof Error) return true
  if ('message' in (error as any) && 'stack' in (error as any)) {
    return true
  }
  return false
}

function isZodError(error: unknown): error is z.core.$ZodError {
  if (error instanceof z.core.$ZodError) return true
  return false
}

function simplifyZodMessages(error: z.core.$ZodError) {
  return error?.issues.reduce((prev: string, curr: z.core.$ZodIssue) => {

    if (prev === '') prev += curr.message

    else prev += `; ${curr.message}`
    return prev
  }, '')
}

function isValidStringArray<T extends string = string>(arr: unknown): arr is T[] {
  return (
    Array.isArray(arr) &&
    arr.length > 0 &&
    arr.every((item): item is T => typeof item === 'string' && item.trim().length > 0)
  )
}

function utils() {
  return {
    type,
    mimeType: (extension: string) => customMime(extension) || mime.lookup(extension) || (extension === '' ? 'blank' : 'unknown'),
    mediumType: (extension: string): Filesystem['mediumType'] => {
      if (!extension || typeof extension !== 'string') {
        return 'unknown'
      }

      if (extension.indexOf('/') === -1) {
        if (['image', 'photo'].includes(extension)) {
          return 'image'
        }

        if (['video'].includes(extension)) {
          return 'video'
        }

        if (['blank'].includes(extension)) {
          return 'folder'
        }

        return 'unknown'
      }

      const etype = extension.split('/')[0]
      switch (etype) {
        case 'application':
          const appType = extension.split('/')[1]
          if (appType === 'xml' || appType === 'text') {
            return appType
          }
          return 'unknown'
        default:
          if (etype === 'text' || etype === 'image' || etype === 'video') {
            return etype
          }
          return 'unknown'
      }
    },
    thumbPath: (filename: XmlItem['filename'], gallery: Gallery) => rasterPath(filename, gallery, 'thumb'),
    photoPath: (filename: XmlItem['filename'], gallery: Gallery) => rasterPath(filename, gallery, 'photo'),
    getVideoPaths,
    filenameAsJpg,
    /*
    Construct a file system path from the history public folder

    @method safePublicPath
    @param {string} relative or absolute path from /history/public folder; root absolute paths are rejected
    @return {Promise} string of safe file system path
    @throws {Error}
    */
    safePublicPath: (rawDestinationPath: string): string | never => {
      try {
        const normalizedDestinationPath = path.normalize(rawDestinationPath)
        const publicPath = path.normalize(path.join(process.cwd(), 'public'))
        const isRawInPublic = normalizedDestinationPath.startsWith(publicPath)
        const safeDestinationPath = (isRawInPublic) ? normalizedDestinationPath : path.join(publicPath, normalizedDestinationPath)

        if (!safeDestinationPath.startsWith(publicPath)) {
          throw new Error(`Restrict to public file system (${safeDestinationPath}); publicPath(${publicPath})`)
        }

        return safeDestinationPath
      } catch (e) {
        if (e instanceof TypeError) { // path core module error
          throw new Error('Invalid file system path')
        }

        throw e
      }
    },

    /*
    Find associated files based on glob pattern

    @method glob
    @param {string} pattern glob file extension pattern to find matching filenames
    @return {string[]} array of string associated filenames with absolute path
    */
    glob: async (pattern: string) => {
      const files = await globNpm(pattern)
      return files.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }))
    },
  }
}

export default utils
export { isStandardError, isValidStringArray, isZodError, simplifyZodMessages }

