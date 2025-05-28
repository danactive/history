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
  }: ReturnType<typeof validateRequestBody>,
): Promise<ResponseBody> {
  const fullPath = await checkPathExists(sourceFolder)
  const filesOnDisk = await readdir(fullPath)

  // Filter filesOnDisk to those present in filenames (and preserve filename order)
  const existingFilenames = filenames.filter((f) => filesOnDisk.includes(f))

  // Extract base names in order from `filenames` (excluding duplicates)
  const seenBases = new Set<string>()
  const orderedBaseNames: string[] = []

  for (const filename of existingFilenames) {
    const base = path.parse(filename).name
    if (!seenBases.has(base)) {
      seenBases.add(base)
      orderedBaseNames.push(base)
    }
  }

  // Generate new base names in the same order
  const generatedFilenames = futureFilenamesOutputs(orderedBaseNames, prefix) // { files: string[] }

  // Map of original base => new base
  const baseMap = new Map<string, string>()
  orderedBaseNames.forEach((base, index) => {
    baseMap.set(base, generatedFilenames.files[index])
  })

  // Final output: filenames in same order as `filenames`, but renamed with same extension
  const futureFilenames = existingFilenames.map((originalFile) => {
    const parsed = path.parse(originalFile)
    const newBase = baseMap.get(parsed.name)
    return newBase ? `${newBase}${parsed.ext}` : originalFile // fallback just in case
  })

  const out = {
    filenames: futureFilenames,
    xml: generatedFilenames.xml,
  }

  if (dryRun) {
    return {
      ...out,
      renamed: false,
    }
  }

  // Rename files on the filesystem
  await Promise.all(
    existingFilenames.map((originalFile, index) => {
      const from = path.join(fullPath, originalFile)
      const to = path.join(fullPath, futureFilenames[index])

      if (from !== to) {
        return rename(from, to)
      }
      return Promise.resolve() // no-op if no change
    }),
  )

  return {
    ...out,
    renamed: true,
  }
}

export {
  errorSchema,
  renamePaths,
  type ResponseBody as RenameResponseBody,
  type RequestSchema as RenameRequestBody,
}
