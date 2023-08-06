import boom from 'boom'
import fs from 'node:fs'
import path from 'node:path'
import { promisify } from 'node:util'

import utilsFactory from './utils'

const getStat = promisify(fs.stat)

const MODULE_NAME = 'pathExists'

/*
Verify if a path exists on the file system

@method pathExists
@param {string} verifyPath relative/absolute path (file or folder) on the file system
@returns {Promise} root absolute path
*/
const pathExists = async (verifyPath, errorSchema) => {
  if (verifyPath === undefined || verifyPath === null) {
    throw boom.notFound(`${MODULE_NAME}: File system path is missing (${verifyPath})`)
  }

  const utils = utilsFactory(errorSchema)

  try {
    const verifiedPath = utils.safePublicPath(verifyPath)
    const stats = await getStat(verifiedPath)

    if (stats.isFile() || stats.isDirectory()) {
      return verifiedPath
    }

    throw boom.notFound('File failed')
  } catch (error) {
    if (typeof verifyPath === 'string' || verifyPath instanceof String) {
      const pathType = path.isAbsolute(verifyPath) ? 'absolute' : 'relative'

      throw boom.notFound(`${MODULE_NAME}: File system path is ${pathType} and not found due to error (${error})`)
    } else {
      throw boom.notFound(`${MODULE_NAME}: File system path is not found due to error (${error})`)
    }
  }
}

module.exports = { pathExists }
