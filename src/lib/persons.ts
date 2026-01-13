import { getAllItems, personsPageItemMapper } from './get-all-items'
import transformJsonSchema, { errorSchema, type ErrorOptionalMessage } from '../models/person'
import type { Gallery, Person } from '../types/common'
import type { All } from '../types/pages'
import { handleLibraryError } from './utils'
import { readPersons } from './xml'

type Envelope = { body: Person[], status: number }
type ErrorOptionalMessageBody = {
  body: ErrorOptionalMessage; status: number;
}
type ReturnAlbumOrErrors = Promise<Envelope | Person[] | ErrorOptionalMessage | ErrorOptionalMessageBody>
async function get<T extends boolean = false>(
  gallery: Gallery,
  returnEnvelope?: T,
): Promise<T extends true ? Envelope : Person[]>
/**
 * Get Persons XML from local filesystem
 * @param {string} gallery name of gallery
 * @param {boolean} returnEnvelope will enable a return value with HTTP status code and body
 * @returns {object} person
 */
async function get(
  gallery: Gallery,
  returnEnvelope: boolean,
): ReturnAlbumOrErrors {
  try {
    if (gallery === null || gallery === undefined) {
      throw new ReferenceError('Gallery name is missing')
    }
    const xmlPerson = await readPersons(gallery)
    const body = transformJsonSchema(xmlPerson)

    if (returnEnvelope) {
      return { body, status: 200 }
    }

    return body
  } catch (err) {
    const message = `No person file was found; gallery=${gallery};`
    return handleLibraryError(err, message, returnEnvelope, errorSchema)
  }
}

export async function getPersonsData({ gallery }: All.Params): Promise<All.ItemData> {
  return getAllItems(gallery, personsPageItemMapper, false)
}

export default get
