import { readdir, rename } from 'node:fs/promises'
import path from 'node:path'

import { validateRequestBody, type RequestSchema } from '../models/rename'
import checkPathExists from './exists'
import { futureFilenamesOutputs } from './filenames'

type ResponseBody = {
  renamed: boolean;
  filenames: string[];
  xml: string;
}

type ErrorOptionalMessage = ResponseBody & { error?: { message: string } }
const errorSchema = (message: string): ErrorOptionalMessage => {
  const out = { renamed: false, filenames: [], xml: '' }
  if (!message) return out
  return { ...out, error: { message } }
}

/*
Renamed file paths

@method renamePaths
@param {string} sourceFolder Folder that contains the raw camera photo files
@param {string[]} filenames Current filenames (file and extension) of raw camera photo files
@param {string} prefix root name will become the new filename plus the dynamic suffix
@param {bool} [dryRun] Preview the renaming of files without the filesystem change
@return {Promise}
*/
async function renamePaths({
  dryRun = false,
  filenames,
  prefix,
  sourceFolder,
  renameAssociated = false,
}: ReturnType<typeof validateRequestBody>): Promise<ResponseBody> {
  const fullPath = await checkPathExists(sourceFolder)
  const filesOnDisk = await readdir(fullPath)

  // Filter only filenames that exist if renameAssociated is false
  const filtered = renameAssociated ? filenames : filenames.filter((f) => filesOnDisk.includes(f))

  // Extract unique base names in order
  const baseSeen = new Set<string>()
  const orderedBases = filtered
    .map((f) => path.parse(f).name)
    .filter((base) => {
      if (baseSeen.has(base)) return false
      baseSeen.add(base)
      return true
    })

  if (orderedBases.length === 0) {
    return { filenames: [], xml: '', renamed: false }
  }

  const generated = futureFilenamesOutputs(orderedBases, prefix)
  const baseToNewBase = new Map(orderedBases.map((b, i) => [b, generated.files[i]]))

  const seenOutput = new Set<string>()
  const renameOps: { from: string; to: string }[] = []
  const outputFilenames: string[] = []

  filenames.forEach((original) => {
    const originalBase = path.parse(original).name
    const newBase = baseToNewBase.get(originalBase)
    if (!newBase) return

    let matches: string[]
    if (renameAssociated) {
      matches = filesOnDisk.filter((f) => path.parse(f).name === originalBase)
    } else if (filesOnDisk.includes(original)) {
      matches = [original]
    } else {
      matches = []
    }

    matches.forEach((match) => {
      const { ext } = path.parse(match)
      const renamed = `${newBase}${ext}`
      if (!seenOutput.has(renamed)) {
        seenOutput.add(renamed)
        outputFilenames.push(renamed)
        renameOps.push({
          from: path.join(fullPath, match),
          to: path.join(fullPath, renamed),
        })
      }
    })
  })

  if (dryRun) {
    return {
      filenames: outputFilenames,
      xml: generated.xml,
      renamed: false,
    }
  }

  await Promise.all(renameOps.map(({ from, to }) => (from === to ? Promise.resolve() : rename(from, to))))

  return {
    filenames: outputFilenames,
    xml: generated.xml,
    renamed: true,
  }
}

export {
  errorSchema,
  renamePaths,
  type ResponseBody as RenameResponseBody,
  type RequestSchema as RenameRequestBody,
}
