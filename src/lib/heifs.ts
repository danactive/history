import convert from 'heic-convert'
import { readFile, writeFile } from 'node:fs/promises'
import { basename } from 'node:path'
import type { Filesystem } from './filesystems'
import utilsFactory, { isStandardError } from './utils'

type ResponseBody = {
  created: string[];
}

type ErrorOptionalMessage = ResponseBody & { error?: { message: string } }
const errorSchema = (message: string): ErrorOptionalMessage => {
  const out = { created: [] }
  if (!message) return out
  return { ...out, error: { message } }
}

type ResponseEnvelope = {
  body: ResponseBody;
  status: number;
}

function uniqueHeifs(files: Filesystem[]) {
  const groupedFiles = files.reduce((groups: Record<string, Filesystem[]>, file) => {
    const nameWithoutExt = basename(file.name, file.ext)
    if (!groups[nameWithoutExt]) {
       
      groups[nameWithoutExt] = []
    }
    groups[nameWithoutExt].push(file)
    return groups
  }, {})

  const heifFilesWithoutJpg = Object.values(groupedFiles)
    .filter((filteredFiles) => filteredFiles.some((file) => file.ext === 'heic') && !filteredFiles.some((file) => file.ext === 'jpg'))
    .flat()

  return heifFilesWithoutJpg
}

const utils = utilsFactory()
async function processHeif(file: Filesystem, destinationPath: string): Promise<string> {
  const filenameHeif = utils.filenameAsJpg(file.filename)
   
  const inputBuffer = await readFile(`public/${file.path}`)
   
  const outputBuffer = await convert({
    // @ts-ignore @types/heic-convert v2.1.0 has incorrect type https://github.com/catdad-experiments/heic-convert/issues/42
    buffer: inputBuffer, // the HEIF file buffer
    format: 'JPEG', // output format
    quality: 0.8, // the jpeg compression quality, between 0 and 1
  })
   
  await writeFile(`public${destinationPath}/${filenameHeif}`, new Uint8Array(outputBuffer))
  return filenameHeif
}

async function post<T extends boolean = false>(
  files: Filesystem[],
  destinationPath: string,
  returnEnvelope?: T,
): Promise<T extends true ? ResponseEnvelope : ResponseBody>;

/**
 * Generate a photo image from HEIF files
 * @param {string} destinationPath path to save the converted files
 * @param {boolean} returnEnvelope will enable a return value with HTTP status code and body
 * @returns {Promise} files
 */
async function post(
  files: Filesystem[],
  destinationPath: string,
  returnEnvelope = false,
) {
  try {
    const heifs: string[] = []
    for (const file of uniqueHeifs(files)) {
       
      heifs.push(await processHeif(file, destinationPath))
    }

    const body = { created: heifs }
    if (returnEnvelope) {
      return { body, status: 200 }
    }

    return body
  } catch (e) {
    if (returnEnvelope && isStandardError(e)) {
      return { body: errorSchema(e.message), status: 400 }
    }

    if (returnEnvelope) {
      return { body: errorSchema('Fail to process HEIFs'), status: 400 }
    }

    throw e
  }
}

export { errorSchema, type ResponseBody as HeifResponseBody }
export default post
