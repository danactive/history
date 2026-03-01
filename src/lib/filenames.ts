import path from 'node:path'

import config from '../models/config'
import utilsFactory from './utils'
import { buildAlbumXml, type AlbumXmlItem } from './album-xml'

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


/*
Generate renamed files

@method futureFilenamesOutputs
@param {string[]} sourceFilenames List of filenames to rename
@param {string} prefix YYYY-MM-DD or YYYY-MM-DD-ID
@param {number} [xmlStartPhotoId] Initial position for XML id (default 100)
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

  function outputFormats() {
    const files: string[] = []
    const filenames: string[] = []
    const items: AlbumXmlItem[] = []
    const spread = filenameSpread()
    let i = 0
    uniqueFilenames.forEach((unique) => {
      const file = `${prefix}-${spread[i]}`
      files.push(file)
      const filename = `${file}.jpg`
      filenames.push(filename)
      items.push({
        base: file,
        filename,
        isVideo: videoTypeInList(sourceFilenames, unique),
      })
      i += 1
    })

    return { filenames, files, xml: buildAlbumXml(items, xmlStartPhotoId) }
  }

  return outputFormats()
}

function exactModeOutputs(
  orderedBases: string[],
  exactFilenameBase: string,
  sourceFilenames: string[] = orderedBases.map((base) => `${base}.jpg`),
) {
  if (orderedBases.length !== 1) {
    throw new ReferenceError('Exact filename mode requires a single selected base')
  }

  const files = orderedBases.map(() => exactFilenameBase)
  const items: AlbumXmlItem[] = files.map((file) => ({
    base: file,
    filename: `${file}.jpg`,
    isVideo: videoTypeInList(sourceFilenames, orderedBases[0]),
  }))
  // Exact mode starts at 101 so first item id is MMDD01.
  return { files, xml: buildAlbumXml(items, 101) }
}

export { exactModeOutputs, futureFilenamesOutputs, uniqueFiles, videoTypeInList }
