import type { Person, XmlPerson, XmlPersons } from '../types/common'

export type ErrorOptionalMessage = { persons: object[]; error?: { message: string } }
export const errorSchema = (message: string): ErrorOptionalMessage => {
  const out = { persons: [] }
  if (!message) return out
  return { ...out, error: { message } }
}

function transform(person: XmlPerson): Person {
  return {
    first: person.first,
    last: person.last,
    full: `${person.first} ${person.last}`,
  }
}

function transformJsonSchema(json: XmlPersons): Person[] {
  if (Array.isArray(json.persons)) {
    return json.persons.map(transform)
  }
  return [transform(json.persons)]
}

export default transformJsonSchema
