import async from 'async'
import Boom from 'boom'
import fs from 'node:fs/promises'
import path from 'node:path'

import exists from './exists'
import utilsFactory from './utils'

type Pair = { current: string, future: string }

const utils = utilsFactory()

/*
Reassign associated filename based on file without extension

@method reassignAssociated
@param {string[]} [absoluteFolderFilenames] Filenames that contains the raw camera photo files with absolute path
@param {string} [futureFile] Future file (without extension) of renamed new name based on date
@return {Promise} associated filenames with path
*/
function reassignAssociated(absoluteFolderFilenames: string[], futureFile: string): Promise<string[]> {
  return new Promise((resolve) => {
    resolve(absoluteFolderFilenames.map((filename) => {
      const fileParts = path.parse(filename)

      return path.join(fileParts.dir, futureFile + fileParts.ext)
    }))
  })
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
async function renamePaths(
  sourceFolder: string,
  filenames: string[],
  futureFilenames: string[],
  { preview, renameAssociated }: { preview?: boolean, renameAssociated?: boolean } = { preview: false, renameAssociated: false },
) {
  const renamedFilenames: string[] = []
  const q = async.queue(async (rename: { newName: string; oldName: string }, next: () => void) => {
    const isExist = await exists(rename.oldName)
    console.log('rename', rename.oldName, rename.newName, isExist)
    if (!preview) {
      await fs.rename(rename.oldName, rename.newName)
    }
    renamedFilenames.push(rename.newName)
    next()
  }, 2)

  q.error((err, task) => {
    console.error('task experienced an error', err, task)
  })

  const fullPath = utils.safePublicPath(sourceFolder)
  const transformFilenames = async (pair: Pair) => {
    if (renameAssociated) {
      const associatedFilenames = await utils.glob(`${path.join(fullPath, pair.current)}.*`)
      const oldNames: string[] = associatedFilenames
      const endWithoutExt = pair.future.length - path.extname(pair.future).length
      const futureFile = pair.future.substr(0, endWithoutExt) // strip extension

      const reassignFilenames = await reassignAssociated(associatedFilenames, futureFile)

      const reassignPairs = oldNames.map((oldName, index) => ({ oldName, newName: reassignFilenames[index] }))

      return reassignPairs
    }
    const oldName = path.join(fullPath, pair.current)
    const newName = path.join(fullPath, pair.future)

    return { oldName, newName }
  }

  const filenamePairs: Pair[] = filenames.map((filename, index) => ({ current: filename, future: futureFilenames[index] }))

  async.map(filenamePairs, transformFilenames, (error: Error, transformedPairs: any) => {
    if (error) {
      console.log('transformedPairs error', error)
    }

    if (Array.isArray(transformedPairs)) {
      q.push([...[].concat(...transformedPairs)])
    } else {
      q.push(transformedPairs)
    }
  })

  // queue completes
  q.drain(() => {
    console.log('all items have been processed')
  })
  // console.log('drain renamedFilenames', renamedFilenames)
  // return renamedFilenames
}

export {
  reassignAssociated,
  renamePaths,
}
