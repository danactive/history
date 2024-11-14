import transformJsonSchema, { errorSchema, type ErrorOptionalMessage } from '../models/person'
import type { AlbumMeta, Person } from '../types/common'
import { getPersonsFromFilesystem } from './xml'

type Envelope = { body: Person[], status: number }
type ErrorOptionalMessageBody = {
  body: ErrorOptionalMessage; status: number;
}
type ReturnAlbumOrErrors = Promise<Envelope | Person[] | ErrorOptionalMessage | ErrorOptionalMessageBody>
async function get<T extends boolean = false>(
  gallery: AlbumMeta['gallery'],
  personAgeRelativeDate: Date | null,
  returnEnvelope?: T,
): Promise<T extends true ? Envelope : Person[]>
/**
 * Get Persons XML from local filesystem
 * @param {string} gallery name of gallery
 * @param {date} personAgeRelativeDate calculate person age based on this date
 * @param {boolean} returnEnvelope will enable a return value with HTTP status code and body
 * @returns {object} person
 */
async function get(
  gallery: AlbumMeta['gallery'],
  personAgeRelativeDate: Date | null,
  returnEnvelope: boolean,
): ReturnAlbumOrErrors {
  try {
    if (gallery === null || gallery === undefined) {
      throw new ReferenceError('Gallery name is missing')
    }
    const json = await getPersonsFromFilesystem(gallery)
    const body = transformJsonSchema(json, personAgeRelativeDate)

    if (returnEnvelope) {
      return { body, status: 200 }
    }

    return body
  } catch (e) {
    const message = `No person file was found; gallery=${gallery};`
    if (returnEnvelope) {
      return { body: errorSchema(message), status: 404 }
    }

    // eslint-disable-next-line no-console
    console.error('ERROR', message, e)
    throw e
  }
}

export default get
