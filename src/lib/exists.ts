import fs from 'node:fs'
import path from 'node:path'
import { promisify } from 'node:util'

import utilsFactory from './utils'

const getStat = promisify(fs.stat)

const MODULE_NAME = 'pathExists'

/**
Verify if a path exists on the file system

@function pathExists
@param {string} verifyPath relative/absolute path (file or folder) on the file system
@returns {Promise} root absolute path
*/
const pathExists = async (verifyPath: string | undefined | null) => {
  if (verifyPath === undefined || verifyPath === null) {
    throw new Error(`${MODULE_NAME}: File system path is missing (${verifyPath})`)
  }

  const utils = utilsFactory()

  try {
    const verifiedPath = utils.safePublicPath(verifyPath)
    const stats = await getStat(verifiedPath)

    if (stats.isFile() || stats.isDirectory()) {
      return verifiedPath
    }

    throw new Error(`${MODULE_NAME}: File failed - not a file or directory`)
  } catch (error) {
    if (typeof verifyPath === 'string') {
      const pathType = path.isAbsolute(verifyPath) ? 'absolute' : 'relative'
      throw new Error(`${MODULE_NAME}: File system path is ${pathType} and not found due to error (${(error as Error).message})`)
    } else {
      throw new Error(`${MODULE_NAME}: File system path is not found due to error (${(error as Error).message})`)
    }
  }
}

export default pathExists
