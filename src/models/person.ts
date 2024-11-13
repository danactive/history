import type { Person, XmlPerson, XmlPersons } from '../types/common'

export type ErrorOptionalMessage = { persons: object[]; error?: { message: string } }
export const errorSchema = (message: string): ErrorOptionalMessage => {
  const out = { persons: [] }
  if (!message) return out
  return { ...out, error: { message } }
}

function transform(person: XmlPerson): Person {
  const { first, last } = person.$
  return {
    first,
    last,
    full: `${first} ${last}`,
  }
}

function transformJsonSchema(json: XmlPersons): Person[] {
  if (Array.isArray(json.persons.person)) {
    return json.persons.person.map(transform)
  }
  return [transform(json.persons.person)]
}

export default transformJsonSchema
