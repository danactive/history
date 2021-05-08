const appRoot = require('app-root-path')
const mime = require('mime-types')
const path = require('path')

const configFile = require('../../../../../config.json')

function customMime(rawExtension) {
  const extension = (rawExtension) ? rawExtension.toLowerCase() : null

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

const file = {
  type: (filepath) => {
    if (!filepath) {
      return false
    }

    if (filepath.lastIndexOf('.') === 0) {
      return path.parse(filepath).name.substr(1)
    }

    return path.extname(filepath).substr(1)
  },
  mimeType: (extension) => customMime(extension) || mime.lookup(extension),
  mediumType: (extension) => {
    if (!extension) {
      return false
    }

    if (typeof extension !== 'string') {
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
  absolutePath: (filepath) => (path.isAbsolute(filepath) ? filepath : appRoot.resolve(filepath)),
  photoPath: (filepath) => filepath && filepath.replace('thumbs', 'photos'),
}

function utils(errorSchema) {
  /*
   Construct a file system path from the history public folder

   @method safePublicPath
   @param {string} relative or absolute path from /history/public folder; root absolute paths are rejected
   @return {Promise} string
  */
  file.safePublicPath = (rawDestinationPath) => {
    try {
      const normalizedDestinationPath = path.normalize(rawDestinationPath)
      const publicPath = path.normalize(path.join(process.cwd(), '../public'))
      const isRawInPublic = normalizedDestinationPath.startsWith(publicPath)
      const safeDestinationPath = (isRawInPublic) ? normalizedDestinationPath : path.join(publicPath, normalizedDestinationPath)

      if (!safeDestinationPath.startsWith(publicPath)) {
        return { body: errorSchema(`Restrict to public file system (${safeDestinationPath}); publicPath(${publicPath})`), status: 404 }
      }

      return safeDestinationPath
    } catch (error) {
      if (error.name === 'TypeError') { // path core module error
        return { body: errorSchema('Invalid file system path'), status: 406 }
      }

      return { body: errorSchema(error.message), status: 400 }
    }
  }

  return file
}

module.exports = utils
