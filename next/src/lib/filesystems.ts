import { glob } from 'glob'
import path from 'node:path'

import utilsFactory from './utils'

type ErrorOptionalMessage = { files: object[]; error?: { message: string } }
const errorSchema = (message, destinationPath = ''): ErrorOptionalMessage => {
  const out = { files: [], destinationPath }
  if (!message) return out
  return { ...out, error: { message } }
}

type Filesystem = {
  ext: string;
  name: string;
  filename: string;
  path: string;
  mediumType: string;
}

type Filesystems = {
  albums: Filesystem[]
}

type FilesystemBody = {
  body: Filesystems; status: number;
}

type ErrorOptionalMessageBody = {
  body: ErrorOptionalMessage; status: number;
}

async function get<T extends boolean = false>(destinationPath: string, returnEnvelope?: T): Promise<T extends true ? FilesystemBody : Filesystems>;

/**
 * Get file/folder listing from local filesystem
 * @param {string} destinationPath path to lookup
 * @param {boolean} returnEnvelope will enable a return value with HTTP status code and body
 * @returns {Promise} files
 */
async function get(destinationPath = '', returnEnvelope = false): Promise<
  Filesystems | ErrorOptionalMessage | FilesystemBody | ErrorOptionalMessageBody
> {
  try {
    const utils = utilsFactory()
    const publicPath = utils.safePublicPath('/')
    const globPath = path.join(publicPath, destinationPath)

    if (!globPath.startsWith(publicPath)) {
      return { body: errorSchema('Invalid system path'), status: 404 }
    }

    const files = await glob(decodeURI(`${globPath}/*`))

    const webPaths = files.map((file) => {
      const fileMeta: Filesystem = {
        ext: utils.type(file), // case-insensitive
        name: null,
        filename: null,
        path: file.replace(globPath, destinationPath),
        mediumType: null,
      }
      fileMeta.name = path.basename(file, `.${fileMeta.ext}`)
      fileMeta.filename = (fileMeta.ext === '') ? fileMeta.name : `${fileMeta.name}.${fileMeta.ext}`

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

export { errorSchema, type Filesystem }
export default get
