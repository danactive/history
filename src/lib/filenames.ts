import path from 'node:path'

import utilsFactory from './utils'

const utils = utilsFactory()

/**
 * Count unique filenames
 * @param sourceFilenames
 * @return {Set} uniques
 */
function uniqueFiles(sourceFilenames: string[]) {
  const uniques: Set<string> = new Set()
  sourceFilenames.forEach((filename) => {
    uniques.add(path.parse(filename).name)
  })

  return uniques
}

function videoTypeInList(sourceFilenames: string[], sourceFile: string) {
  const filenameSet = sourceFilenames.filter((s) => s.indexOf(sourceFile) === 0)
  const media = filenameSet.map((f) => utils.mediumType(utils.mimeType(utils.type(f))))
  const videoFiles = media.filter((m) => m === 'video')
  return videoFiles.length > 0
}

/*
Generate renamed files

@method futureFilenamesOutputs
@param {string[]} sourceFilenames List of filenames to rename
@param {string} prefix Root of filename with increment added before extension
@param {string} [xmlStartPhotoId] initial position
@return {json}
*/
function futureFilenamesOutputs(sourceFilenames: string[], prefix: string, xmlStartPhotoId = 100) {
  const uniqueFilenames = uniqueFiles(sourceFilenames)
  const photosInDay = uniqueFilenames.size

  function filenameSpread() {
    const FIRST_PHOTO_NUMBER = 10 // 1-9 are reserved for future photo additions
    const LAST_PHOTO_NUMBER = 90 // 91-99 are reserved for future photo additions

    const maxRange = (LAST_PHOTO_NUMBER - FIRST_PHOTO_NUMBER) + 1 //  +1 to include both #s in the range
    const increment = maxRange / photosInDay
    const incrementInt = Math.floor(increment)
    const incrementFloat = increment - incrementInt
    const output = []

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
      output.push((photoIncrement < 10) ? `0${photoIncrement}` : photoIncrement)
    }

    return output
  }

  function xmlSchema(filename: string, id: number, sourceFile: string, file: string) {
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
      xml += xmlSchema(filename, (xmlStartPhotoId + i), unique, file)
      i += 1
    })

    return { filenames, files, xml }
  }

  return outputFormats()
}

export { futureFilenamesOutputs, uniqueFiles, videoTypeInList }
