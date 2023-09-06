import { glob } from 'glob'
import path from 'node:path'

import utilsFactory from './utils'

type ErrorOptionalMessage = { files: object[]; error?: { message: string } }
const errorSchema = (message: string): ErrorOptionalMessage => {
  const out = { files: [] }
  if (!message) return out
  return { ...out, error: { message } }
}

type Filesystem = {
  id: string;
  label: string;
  ext: string;
  name: string;
  filename: string;
  path: string;
  mediumType: string;
}

type FilesystemBody = {
  files: Filesystem[];
  destinationPath: string;
}

type FilesystemEnvelope = {
  body: FilesystemBody;
  status: number;
}

type ErrorOptionalMessageBody = {
  body: ErrorOptionalMessage; status: number;
}

async function get<T extends boolean = false>(
  destinationPath: string | string[] | undefined,
  returnEnvelope?: T,
): Promise<T extends true ? FilesystemEnvelope : FilesystemBody>;

/**
 * Get file/folder listing from local filesystem
 * @param {string} destinationPath path to lookup
 * @param {boolean} returnEnvelope will enable a return value with HTTP status code and body
 * @returns {Promise} files
 */
async function get(
  destinationPath: string | string[] | undefined = '',
  returnEnvelope = false,
): Promise<
  FilesystemEnvelope | FilesystemBody | ErrorOptionalMessage | ErrorOptionalMessageBody
> {
  try {
    if (destinationPath === null || destinationPath === undefined || Array.isArray(destinationPath)) {
      throw new ReferenceError('Filesystem path is missing')
    }
    const utils = utilsFactory()
    const publicPath = utils.safePublicPath('/')
    const globPath = path.join(publicPath, destinationPath)

    if (!globPath.startsWith(publicPath)) {
      return { body: errorSchema('Invalid system path'), status: 404 }
    }

    const files = await glob(decodeURI(`${globPath}/*`))

    const webPaths = files.map((file): Filesystem => {
      const fileExt = utils.type(file) // case-insensitive
      const fileName = path.basename(file, `.${fileExt}`)
      const mediumType = utils.mediumType(utils.mimeType(fileExt))
      const filePath = file.replace(globPath, destinationPath)
      const filename = (fileExt === '') ? fileName : `${fileName}.${fileExt}`

      return {
        filename,
        label: filename,
        mediumType: mediumType || 'folder',
        id: filePath,
        path: filePath,
        ext: fileExt,
        name: fileName,
      }
    }).sort((a, b) => a.name.localeCompare(b.name))

    const body = { files: webPaths, destinationPath }
    if (returnEnvelope) {
      return { body, status: 200 }
    }

    return body
  } catch (e) {
    if (returnEnvelope) {
      return { body: errorSchema('No files or folders are found'), status: 404 }
    }

    throw e
  }
}

export { errorSchema, type Filesystem, type FilesystemBody }
export default get
