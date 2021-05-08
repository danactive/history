import appRoot from 'app-root-path'
import boom from 'boom'
import mime from 'mime-types'
import path from 'path'

import configFile from '../../../../../config.json'

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
      throw boom.forbidden(`Restrict to public file system (${safeDestinationPath}); publicPath(${publicPath})`)
    }

    return safeDestinationPath
  } catch (error) {
    if (error.name === 'TypeError') { // path core module error
      throw boom.notAcceptable('Invalid file system path')
    }

    throw boom.boomify(error)
  }
}

export default file
