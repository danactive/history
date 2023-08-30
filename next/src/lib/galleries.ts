import fsCallback from 'fs' // Dirent type is missing from Node.js v18 fix to import fs from 'node:fs/promises' with v20

const fs = fsCallback.promises

type ErrorOptionalMessage = { galleries: object[]; error?: { message: string } }
const errorSchema = (message?: string) => {
  const out = { galleries: [] }
  if (!message) return out
  return { ...out, error: { message } }
}

type Gallery = string

type Galleries = {
  galleries: Gallery[]
}

type GalleryBody = {
  body: Galleries; status: number;
}

type ErrorOptionalMessageBody = {
  body: ErrorOptionalMessage; status: number;
}

async function get<T extends boolean = false>(returnEnvelope?: T): Promise<T extends true ? GalleryBody : Galleries>;
/**
 * Get Galleries from local filesystem
 * @param {boolean} returnEnvelope will enable a return value with HTTP status code and body
 * @returns {Promise} galleries
 */
async function get(returnEnvelope = false): Promise<
  Galleries | ErrorOptionalMessage | GalleryBody | ErrorOptionalMessageBody
> {
  try {
    const hasPrefix = (content: fsCallback.Dirent) => content.isDirectory()
    const namesOnly = (content: fsCallback.Dirent) => content.name

    const contents = await fs.readdir('../public/galleries', { withFileTypes: true })
    const body = { galleries: contents.filter(hasPrefix).map(namesOnly) }

    if (returnEnvelope) {
      return { body, status: 200 }
    }

    return body
  } catch (e) {
    if (returnEnvelope) {
      return { body: errorSchema('No galleries are found'), status: 404 }
    }

    return errorSchema()
  }
}

export { errorSchema, type Gallery }
export default get
