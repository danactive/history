import fs, { readdir } from 'node:fs/promises'
import path from 'node:path'

import exists from './exists'
import utilsFactory from './utils'
import { validateRequestBody } from '../models/rename'

const utils = utilsFactory()

type ResponseBody = {
  renamed: string[];
}

type ErrorOptionalMessage = ResponseBody & { error?: { message: string } }
const errorSchema = (message: string): ErrorOptionalMessage => {
  const out = { renamed: [] }
  if (!message) return out
  return { ...out, error: { message } }
}

/*
Renamed file paths

@method renamePaths
@param {string} sourceFolder Folder that contains the raw camera photo files
@param {string[]} filenames Current filenames (file and extension) of raw camera photo files
@param {string[]} futureFilenames Future filenames (file and extension) of renamed camera photo files
@param {object} [options] Additional optional options
@param {bool} options.renameAssociated Find matching files with different extensions, then rename them
@return {Promise}
*/
// // futureFilenames: string[],
  // options: { preview?: boolean; renameAssociated?: boolean } = {},
async function renamePaths(
  {
    sourceFolder,
    filenames,
  }: ReturnType<typeof validateRequestBody>
): Promise<string[]> {
  //{"filenames":["2024-12-01-50.jpg","2024-12-05-50.jpg"],"prefix":"ppp","source_folder":"/galleries/dan/todo/originals","preview":false,"raw":true,"rename_associated":true}
  const fullPath = utils.safePublicPath(sourceFolder)
  const files = await readdir(fullPath)

  return files.reduce((prev: string[], file) => {
    if (file === filenames[0]) {
      prev.push(file)
    }
    return prev
  }, [])
}

export {
  errorSchema,
  renamePaths,
}
