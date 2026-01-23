import type { Gallery, Item, XmlItem } from '../types/common'

const type = (filepath: string): string => {
  const lastDot = filepath.lastIndexOf('.')
  if (lastDot === 0) {
    return filepath.substring(1)
  }
  if (lastDot === -1) {
    return ''
  }
  return filepath.substring(lastDot + 1)
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
export const rasterPath = (filename: XmlItem['filename'], gallery: Gallery, rasterType: 'photo' | 'thumb') => {
  const imageFilename = filenameAsJpg(Array.isArray(filename) ? filename[0] : filename)
  const year = imageFilename.indexOf('-') >= 0 && imageFilename.split('-')[0]

  return `/galleries/${gallery}/media/${rasterType}s/${year}/${imageFilename}`
}

/**
 * Thumbnail path to public folder
 */
export const thumbPath = (filename: XmlItem['filename'], gallery: Gallery) => rasterPath(filename, gallery, 'thumb')

/**
 * Photo path to public folder
 */
export const photoPath = (filename: XmlItem['filename'], gallery: Gallery) => rasterPath(filename, gallery, 'photo')

/**
 * Video paths to public folder on local filesystem
 * @param {object} filename file plus extension
 * @param {string} gallery name
 * @returns {string[]} path
 */
export const getVideoPaths = (filename: XmlItem['filename'], gallery: Gallery) => {
  const filenames = Array.isArray(filename) ? filename : [filename]

  return filenames.map(fn => {
    const year = fn.indexOf('-') >= 0 && fn.split('-')[0]
    return `/galleries/${gallery}/media/videos/${year}/${fn}`
  })
}
