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
async function renamePaths(
  {
    dryRun = false,
    filenames,
    prefix,
    sourceFolder,
    renameAssociated = false,
  }: ReturnType<typeof validateRequestBody>,
): Promise<ResponseBody> {
  const fullPath = await checkPathExists(sourceFolder)
  const filesOnDisk = await readdir(fullPath)

  const outputFilenames: string[] = []
  const renameOperations: { from: string; to: string }[] = []

  // Filter input to those that exist on disk (for renameAssociated = false)
  const filteredFilenames = filenames.filter((f) => filesOnDisk.includes(f))

  // Extract unique base names in order of appearance in `filenames`
  const seenBases = new Set<string>()
  const orderedBaseNames: string[] = []

  for (const filename of filteredFilenames) {
    const base = path.parse(filename).name
    if (!seenBases.has(base)) {
      seenBases.add(base)
      orderedBaseNames.push(base)
    }
  }

  if (orderedBaseNames.length === 0) {
    return {
      filenames: [],
      xml: '',
      renamed: false,
    }
  }

  const generatedFilenames = futureFilenamesOutputs(orderedBaseNames, prefix) // { files: string[], xml: string }

  const baseMap = new Map<string, string>()
  orderedBaseNames.forEach((base, index) => {
    baseMap.set(base, generatedFilenames.files[index])
  })

  // Build outputFilenames and renameOperations preserving original `filenames` order
  for (const original of filenames) {
    const parsed = path.parse(original)
    const base = parsed.name
    const newBase = baseMap.get(base)

    if (!newBase) continue

    const matches = filesOnDisk.filter((f) => path.parse(f).name === base)

    if (renameAssociated) {
      for (const match of matches) {
        const matchParsed = path.parse(match)
        const renamed = `${newBase}${matchParsed.ext}`
        outputFilenames.push(renamed)
        renameOperations.push({
          from: path.join(fullPath, match),
          to: path.join(fullPath, renamed),
        })
      }
    } else {
      if (matches.includes(original)) {
        const renamed = `${newBase}${parsed.ext}`
        outputFilenames.push(renamed)
        renameOperations.push({
          from: path.join(fullPath, original),
          to: path.join(fullPath, renamed),
        })
      }
    }
  }

  if (dryRun) {
    return {
      filenames: outputFilenames,
      xml: generatedFilenames.xml,
      renamed: false,
    }
  }

  await Promise.all(
    renameOperations.map(({ from, to }) => {
      if (from !== to) {
        return rename(from, to)
      }
      return Promise.resolve()
    }),
  )

  return {
    filenames: outputFilenames,
    xml: generatedFilenames.xml,
    renamed: true,
  }
}

export {
  errorSchema,
  renamePaths,
  type ResponseBody as RenameResponseBody,
  type RequestSchema as RenameRequestBody,
}
