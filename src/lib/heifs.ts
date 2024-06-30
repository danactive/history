import convert from 'heic-convert'
import { readFile, writeFile } from 'node:fs/promises'
import type { Filesystem } from './filesystems'
import utilsFactory, { isStandardError } from './utils'

type HeifBody = {
  created: string[];
}

type ErrorOptionalMessage = HeifBody & { error?: { message: string } }
const errorSchema = (message: string): ErrorOptionalMessage => {
  const out = { created: [] }
  if (!message) return out
  return { ...out, error: { message } }
}

type HeifEnvelope = {
  body: HeifBody;
  status: number;
}

async function post<T extends boolean = false>(
  files: Filesystem[],
  destinationPath: string,
  returnEnvelope?: T,
): Promise<T extends true ? HeifEnvelope : HeifBody>;

/**
 * Generate a photo image from HEIC files
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
    const utils = utilsFactory()
    const heifs: string[] = []
    for (const file of files) {
      // eslint-disable-next-line no-await-in-loop
      const inputBuffer = await readFile(`public/${file.path}`)
      // eslint-disable-next-line no-await-in-loop
      const outputBuffer = await convert({
        buffer: inputBuffer, // the HEIC file buffer
        format: 'JPEG', // output format
        quality: 0.8, // the jpeg compression quality, between 0 and 1
      })
      const filenameHeif = utils.filenameAsJpg(file.filename)
      // eslint-disable-next-line no-await-in-loop
      await writeFile(`public${destinationPath}/${filenameHeif}`, new Uint8Array(outputBuffer))
      heifs.push(filenameHeif)
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

export { type HeifBody }
export default post
