// @ts-ignore
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
function renamePaths(
  sourceFolder: string,
  filenames: string[],
  futureFilenames: string[],
  options: { preview?: boolean; renameAssociated?: boolean } = {},
): Promise<string[]> {
  const renamedFilenames = new Set<string>()

  return new Promise((resolve, reject) => {
    const q = async.queue(async (task: { oldName: string; newName: string }) => {
      // Verify source exists
      await exists(task.oldName)

      if (!options.preview) {
        await fs.rename(task.oldName, task.newName)
      }

      renamedFilenames.add(task.newName)

      // Handle associated files if enabled
      if (options.renameAssociated) {
        const baseOld = path.parse(task.oldName).name
        const baseNew = path.parse(task.newName).name
        const dir = path.dirname(task.oldName)

        // Find all files that start with the same base name
        const files = await fs.readdir(dir)
        const associated = files.filter((f) => f.startsWith(baseOld) && f !== path.basename(task.oldName))

        const renamePromises = associated.map((file) => {
          const ext = path.extname(file)
          const name = path.join(dir, file)
          const newName = path.join(dir, `${baseNew}${ext}`)
          if (options.preview) {
            return Promise.resolve(newName)
          }
          return fs.rename(name, newName).then(() => newName)
        })

        const renamedFiles = await Promise.all(renamePromises)
        renamedFiles.forEach((newName) => {
          renamedFilenames.add(newName)
        })
      }
    }, 1)

    // Handle errors
    q.error((err: any) => {
      reject(err)
    })

    // Process all files
    const pairs = filenames.map((filename, i) => ({
      current: utils.safePublicPath(path.join(sourceFolder, filename)),
      future: utils.safePublicPath(path.join(sourceFolder, futureFilenames[i])),
    }))

    // Add tasks to queue
    pairs.forEach((pair) => {
      q.push({
        oldName: pair.current,
        newName: pair.future,
      })
    })

    // Handle completion
    q.drain(() => {
      resolve(Array.from(renamedFilenames))
    })
  })
}

export {
  reassignAssociated,
  renamePaths,
}
