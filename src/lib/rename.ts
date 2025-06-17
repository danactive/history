import * as fs from './fs' // 👈 local wrapper, not 'node:fs/promises'

import path from 'node:path'

import { validateRequestBody, type RequestSchema } from '../models/rename'
import checkPathExists from './exists'
import { futureFilenamesOutputs } from './filenames'
import { type ErrorFormatter } from './resize'

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
  const filesOnDisk = await fs.readdir(fullPath)

  // Filter filenames if renameAssociated is false; else take all input filenames
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

  // For each base, find all files on disk sharing that base, rename all
  for (const base of orderedBases) {
    const newBase = baseToNewBase.get(base)
    if (!newBase) {
      // Defensive: skip if no new base
      continue
    }

    // Find all files on disk matching this base (any extension)
    const matches = filesOnDisk.filter((f) => path.parse(f).name === base)

    for (const match of matches) {
      const ext = path.parse(match).ext
      const renamed = `${newBase}${ext}`

      if (!seenOutput.has(renamed)) {
        seenOutput.add(renamed)
        outputFilenames.push(renamed)
        renameOps.push({
          from: path.join(fullPath, match),
          to: path.join(fullPath, renamed),
        })
      }
    }
  }

  if (renameOps.length === 0) {
    // Nothing to rename
    return { filenames: [], xml: '', renamed: false }
  }

  if (dryRun) {
    // Dry run, do not rename
    return {
      filenames: outputFilenames,
      xml: generated.xml,
      renamed: false,
    }
  }

  // Actually rename the files
  await Promise.all(
    renameOps.map(({ from, to }) =>
      from === to ? Promise.resolve() : fs.rename(from, to),
    ),
  )

  return {
    filenames: outputFilenames,
    xml: generated.xml,
    renamed: true,
  }
}

async function moveRaws(
  { originalPath, filesOnDisk, errors, formatErrorMessage }:
  { originalPath: string, filesOnDisk: string[], errors: string[], formatErrorMessage: ErrorFormatter },
) {
  const rawsPath = path.join(path.dirname(originalPath), 'raws')
  await fs.mkdir(rawsPath, { recursive: true })

  for (const file of filesOnDisk) {
    if (file.toLowerCase().endsWith('.heic') || file.toLowerCase().endsWith('.heif')) {
      const sourceFile = path.join(originalPath, file)
      const destinationFile = path.join(rawsPath, file)

      try {
        await fs.rename(sourceFile, destinationFile) // Move file
        console.log(`Moved: ${file} → raws`)
      } catch (err) {
        errors.push(formatErrorMessage(err, `Error moving HEIF file: ${file}`))
      }
    }
  }
}

export {
  errorSchema, moveRaws, renamePaths, type RequestSchema as RenameRequestBody, type ResponseBody as RenameResponseBody,
}

