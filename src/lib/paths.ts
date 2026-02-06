import type { Gallery, Item, XmlItem } from '../types/common'

const filenameAsJpg = (filename: Item['filename'][0]) => {
  const lastDot = filename.lastIndexOf('.')
  if (lastDot === -1) return `${filename}.jpg`
  const base = filename.slice(0, lastDot)
  const currentExt = filename.slice(lastDot + 1)
  const normalizedExt = currentExt.toLowerCase()
  const futureExt = (normalizedExt === 'jpg' || normalizedExt === 'jpeg') ? normalizedExt : 'jpg'
  return `${base}.${futureExt}`
}

/**
 * Photo or thumbnail path to public folder on local filesystem
 * @param {object} filename file plus extension
 * @param {string} gallery name
 * @param {string} rasterType photo|thumb
 * @returns {string} path
 */
export const rasterPath = (filename: XmlItem['filename'], gallery: Gallery, rasterType: 'original' | 'photo' | 'thumb') => {
  const imageFilename = filenameAsJpg(Array.isArray(filename) ? filename[0] : filename)
  const year = imageFilename.indexOf('-') >= 0 ? imageFilename.split('-')[0] : ''

  return `/galleries/${gallery}/media/${rasterType}s/${year}/${imageFilename}`
}

/**
 * Thumbnail path to public folder
 */
export const thumbPath = (filename: XmlItem['filename'], gallery: Gallery) => rasterPath(filename, gallery, 'thumb')

/**
 * Photo path to public folder (resized for display)
 */
export const photoPath = (filename: XmlItem['filename'], gallery: Gallery) => rasterPath(filename, gallery, 'photo')

/**
 * Original (full-size) image path to public folder
 */
export const originalPath = (filename: XmlItem['filename'], gallery: Gallery) => rasterPath(filename, gallery, 'original')

/**
 * Video paths to public folder on local filesystem
 * @param {object} filename file plus extension
 * @param {string} gallery name
 * @returns {string[]} path
 */
export const getVideoPaths = (filename: XmlItem['filename'], gallery: Gallery) => {
  const filenames = Array.isArray(filename) ? filename : [filename]

  return filenames.map(fn => {
    const year = fn.indexOf('-') >= 0 ? fn.split('-')[0] : ''
    return `/galleries/${gallery}/media/videos/${year}/${fn}`
  })
}
