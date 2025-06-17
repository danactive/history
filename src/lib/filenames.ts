import path from 'node:path'

import config from '../models/config'
import type { Item } from '../types/common'
import utilsFactory from './utils'

const utils = utilsFactory()

// Flatten and normalize all supported photo and video extensions
const allExtensions = [
  ...Object.values(config.supportedFileTypes),
  ...Object.values(config.rawFileTypes),
]
  .flat()
  .map((ext) => ext.toLowerCase())

/**
 * Ignore file extensions and determine unique files
 * @param {string[]} sourceFilenames list of filenames
 * @returns {Set} uniques
 */
function uniqueFiles(sourceFilenames: string[]) {
  const uniques = new Set<string>()

  for (const filename of sourceFilenames) {
    const ext = path.extname(filename).toLowerCase().slice(1) // remove dot

    if (allExtensions.includes(ext)) {
      const base = path.basename(filename, path.extname(filename))
      uniques.add(base)
    } else {
      uniques.add(filename)
    }
  }

  return uniques
}

function videoTypeInList(sourceFilenames: string[], baseName: string) {
  const filenameSet = sourceFilenames.filter((s) => path.parse(s).name === baseName)
  const media = filenameSet.map((f) => utils.mediumType(utils.mimeType(utils.type(f))))
  return media.includes('video')
}


function formatId(filename: string, xmlStartPhotoId: number, i: number) {
  if (formatIdPrefix(filename) === '') return (xmlStartPhotoId + i).toString()
  return formatIdPrefix(filename) + formatIdSuffix(xmlStartPhotoId + i)
}
/**
 * Define an XML id attr based on the filename date
 * @param {string} filename file plus extension
 * @returns {string} four digit id prefix
 */
function formatIdPrefix(filename: Extract<Item['filename'], string>) {
  const [year, month, day] = filename.split('-')
  if (year.length !== 4 || Number.isNaN(year)) {
    return ''
  }
  return `${month.padStart(2, '0')}${day.padStart(2, '0')}`
}

function formatIdSuffix(suffix: number): string {
  if (suffix >= 100) return suffix.toString().slice(1)
  return suffix.toString()
}

/*
Generate renamed files

@method futureFilenamesOutputs
@param {string[]} sourceFilenames List of filenames to rename
@param {string} prefix Root of filename with increment added before extension
@param {number} [xmlStartPhotoId] initial position
@return {json}
*/
function futureFilenamesOutputs(sourceFilenames: string[], prefix: string, xmlStartPhotoId: number = 100) {
  const uniqueFilenames = uniqueFiles(sourceFilenames)
  const photosInDay = uniqueFilenames.size

  function filenameSpread() {
    const FIRST_PHOTO_NUMBER = 10 // 1-9 are reserved for future photo additions
    const LAST_PHOTO_NUMBER = 90 // 91-99 are reserved for future photo additions

    const maxRange = (LAST_PHOTO_NUMBER - FIRST_PHOTO_NUMBER) + 1 //  +1 to include both #s in the range
    const increment = maxRange / photosInDay
    const incrementInt = Math.floor(increment)
    const incrementFloat = increment - incrementInt
    const filenames = []

    for (let i = 1, photoIncrement = 0, prevBuildUp = 0; i <= photosInDay; i += 1) {
      const buildUp = Math.floor(incrementFloat * i)
      if (i === 1 && i === photosInDay) { // only ONE photo
        photoIncrement = 50
      } else if (i === 1) {
        photoIncrement = FIRST_PHOTO_NUMBER + incrementInt + buildUp
      } else if (i === photosInDay) {
        const possibleLast = (photoIncrement + incrementInt + buildUp) - prevBuildUp
        photoIncrement = (possibleLast < LAST_PHOTO_NUMBER) ? possibleLast : LAST_PHOTO_NUMBER
      } else {
        photoIncrement += (incrementInt + buildUp) - prevBuildUp
      }

      prevBuildUp = buildUp
      filenames.push((photoIncrement < 10) ? `0${photoIncrement}` : photoIncrement)
    }

    return filenames
  }

  function xmlSchema(filename: string, id: string, sourceFile: string, file: string) {
    const hasVideo = videoTypeInList(sourceFilenames, sourceFile)

    if (hasVideo) {
      return `<item id="${id}"><type>video</type><filename>${file}.mp4</filename><filename>${file}.webm</filename></item>`
    }

    return `<item id="${id}"><filename>${filename}</filename></item>`
  }

  function outputFormats() {
    const files: string[] = []
    const filenames: string[] = []
    const spread = filenameSpread()
    let i = 0
    let xml = ''
    uniqueFilenames.forEach((unique) => {
      const file = `${prefix}-${spread[i]}`
      files.push(file)
      const filename = `${file}.jpg`
      filenames.push(filename)
      xml += xmlSchema(filename, formatId(filename, xmlStartPhotoId, i), unique, file)
      i += 1
    })

    return { filenames, files, xml }
  }

  return outputFormats()
}

export { futureFilenamesOutputs, uniqueFiles, videoTypeInList }
