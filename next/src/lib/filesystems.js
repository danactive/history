import globCallback from 'glob'
import path from 'node:path'
import { promisify } from 'node:util'

import utilsFactory from './utils'

const glob = promisify(globCallback)

const errorSchema = (message, destinationPath = '') => {
  const out = { files: [], destinationPath }
  if (!message) return out
  return { ...out, error: { message } }
}

/**
 * Get file/folder listing from local filesystem
 * @param {string} destinationPath path to lookup
 * @param {boolean} returnEnvelope will enable a return value with HTTP status code and body
 * @returns {Promise} files
 */
async function get(destinationPath = '', returnEnvelope = false) {
  try {
    const utils = utilsFactory(errorSchema)
    const publicPath = utils.safePublicPath('/')
    const globPath = path.join(publicPath, destinationPath)

    if (!globPath.startsWith(publicPath)) {
      return { body: errorSchema('Invalid system path'), status: 404 }
    }

    const files = await glob(decodeURI(`${globPath}/*`))

    const webPaths = files.map((file) => {
      const fileMeta = {}
      fileMeta.ext = utils.type(file) // case-insensitive
      fileMeta.name = path.basename(file, `.${fileMeta.ext}`)
      fileMeta.filename = (fileMeta.ext === '') ? fileMeta.name : `${fileMeta.name}.${fileMeta.ext}`
      fileMeta.path = file.replace(globPath, destinationPath)

      const mediumType = utils.mediumType(utils.mimeType(fileMeta.ext))
      fileMeta.mediumType = mediumType || 'folder'

      return fileMeta
    })

    const body = { files: webPaths, destinationPath }
    if (returnEnvelope) {
      return { body, status: 200 }
    }

    return body
  } catch (e) {
    if (returnEnvelope) {
      return { body: errorSchema('No files or folders are found', destinationPath), status: 404 }
    }

    return errorSchema(null, destinationPath)
  }
}

export default {
  get,
  errorSchema,
}
