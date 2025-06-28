import type { Dirent } from 'node:fs'
import fs from 'node:fs/promises'

import { type Gallery } from '../types/common'
import { handleLibraryError } from './utils';

type ErrorOptionalMessage = { galleries: object[]; error?: { message: string } }
const errorSchema = (message?: string) => {
  const out = { galleries: [] }
  if (!message) return out
  return { ...out, error: { message } }
}

type GalleryBody = {
  galleries: Gallery[]
}

type GalleryResponse = {
  body: GalleryBody; status: number;
}

type ErrorOptionalMessageBody = {
  body: ErrorOptionalMessage; status: number;
}

async function get<T extends boolean = false>(returnEnvelope?: T): Promise<T extends true ? GalleryResponse : GalleryBody>;
/**
 * Get Galleries from local filesystem
 * @param {boolean} returnEnvelope will enable a return value with HTTP status code and body
 * @returns {Promise} galleries
 */
async function get(returnEnvelope = false): Promise<
  GalleryBody | ErrorOptionalMessage | GalleryResponse | ErrorOptionalMessageBody
> {
  try {
    const hasPrefix = (content: Dirent) => content.isDirectory()
    const namesOnly = (content: Dirent) => content.name

    const contents = await fs.readdir('public/galleries', { withFileTypes: true })
    const body = { galleries: contents.filter(hasPrefix).map(namesOnly) as Gallery[] }

    if (returnEnvelope) {
      return { body, status: 200 }
    }

    return body
  } catch (err) {
    const message = 'No galleries were found'
    return handleLibraryError(err, message, returnEnvelope, errorSchema)
  }
}

export { errorSchema, type Gallery }
export default get
