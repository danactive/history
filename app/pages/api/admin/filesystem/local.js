import globCallback from 'glob'
import path from 'path'
import { promisify } from 'util'

import utils from './utils'

const glob = promisify(globCallback)

async function get(destPath = '') {
  const publicPath = utils.safePublicPath('/')
  const globPath = path.join(publicPath, destPath)

  if (!globPath.startsWith(publicPath)) {
    throw new URIError('Invalid system path')
  }

  const files = await glob(decodeURI(`${globPath}/*`))

  const webPaths = files.map((file) => {
    const fileMeta = {}
    fileMeta.ext = utils.type(file) // case-insensitive
    fileMeta.name = path.basename(file, `.${fileMeta.ext}`)
    fileMeta.filename = (fileMeta.ext === '') ? fileMeta.name : `${fileMeta.name}.${fileMeta.ext}`
    fileMeta.path = file.replace(globPath, destPath)

    const mediumType = utils.mediumType(utils.mimeType(fileMeta.ext))
    fileMeta.mediumType = mediumType || 'folder'

    return fileMeta
  })

  return { body: { files: webPaths, destPath }, status: 200 }
}

export default {
  get,
}
