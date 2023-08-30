import mime from 'mime-types'
import path from 'node:path'

import configFile from '../../../config.json'
import type {
  AlbumMeta,
  Item,
  XmlItem,
  XmlMeta,
} from '../types/common'

const { IMAGE_BASE_URL = '' } = process.env

const type = (filepath: string): string => {
  if (filepath.lastIndexOf('.') === 0) {
    return path.parse(filepath).name.substr(1)
  }

  return path.extname(filepath).substr(1)
}

const filenameAsJpg = (filename: Item['filename'][0]) => {
  const currentExt = type(filename)
  const futureExt = (currentExt.toLowerCase() === 'jpg' || currentExt.toLowerCase() === 'jpeg') ? currentExt : 'jpg'
  const imageFilename = filename.replace(currentExt, futureExt)
  return imageFilename
}

/**
 * Photo or thumbnail path to public folder on local filesystem
 * @param {object} item
 * @param {string} gallery
 * @param {string} rasterType photo|thumb
 * @returns {string} path
 */
const rasterPath = (filename: XmlItem['filename'], gallery: NonNullable<AlbumMeta['gallery']>, rasterType: 'photo' | 'thumb') => {
  const imageFilename = filenameAsJpg(Array.isArray(filename) ? filename[0] : filename)
  const year = imageFilename.indexOf('-') >= 0 && imageFilename.split('-')[0]

  return `${IMAGE_BASE_URL}/galleries/${gallery}/media/${rasterType}s/${year}/${imageFilename}`
}

/**
 * Video paths to public folder on local filesystem
 * @param {object} item
 * @param {string} gallery
 * @returns {string[]} path
 */
const getVideoPaths = (filename: XmlItem['filename'], gallery: NonNullable<AlbumMeta['gallery']>) => {
  const filenames = Array.isArray(filename) ? filename : [filename]
  return filenames.map((f) => {
    const year = f.indexOf('-') >= 0 && f.split('-')[0]
    return `${IMAGE_BASE_URL}/galleries/${gallery}/media/videos/${year}/${f}`
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

  return false
}

function utils() {
  return {
    type,
    mimeType: (extension: string) => customMime(extension) || mime.lookup(extension),
    mediumType: (extension: string | false) => {
      if (!extension || typeof extension !== 'string') {
        return false
      }

      if (extension.indexOf('/') === -1) {
        if (['image', 'photo'].includes(extension)) {
          return 'image'
        }

        if (['video'].includes(extension)) {
          return 'video'
        }

        return false
      }

      return extension.split('/')[0]
    },
    thumbPath: (filename: XmlItem['filename'], gallery: NonNullable<AlbumMeta['gallery']>) => rasterPath(filename, gallery, 'thumb'),
    photoPath: (filename: XmlItem['filename'], gallery: NonNullable<AlbumMeta['gallery']>) => rasterPath(filename, gallery, 'photo'),
    getVideoPaths,
    filenameAsJpg,
    /*
    Construct a file system path from the history public folder

    @method safePublicPath
    @param {string} relative or absolute path from /history/public folder; root absolute paths are rejected
    @return {Promise} string
    */
    safePublicPath: (rawDestinationPath: string): string => {
      try {
        const normalizedDestinationPath = path.normalize(rawDestinationPath)
        const publicPath = path.normalize(path.join(process.cwd(), '../public'))
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
  }
}

export default utils
