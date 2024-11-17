import type { Person, XmlPerson, XmlPersons } from '../types/common'

export type ErrorOptionalMessage = { persons: object[]; error?: { message: string } }
export const errorSchema = (message: string): ErrorOptionalMessage => {
  const out = { persons: [] }
  if (!message) return out
  return { ...out, error: { message } }
}

function transform(person: XmlPerson): Person {
  const { first, last, dob } = person.$

  return {
    first,
    last,
    full: `${first} ${last}`,
    dob: dob ?? null,
  }
}

function transformJsonSchema(xml: XmlPersons): Person[] {
  if (Array.isArray(xml.persons.person)) {
    return xml.persons.person.map((p) => transform(p))
  }
  return [transform(xml.persons.person)]
}

export default transformJsonSchema
export { transform }
