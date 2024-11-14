import type { Person, XmlPerson, XmlPersons } from '../types/common'

export type ErrorOptionalMessage = { persons: object[]; error?: { message: string } }
export const errorSchema = (message: string): ErrorOptionalMessage => {
  const out = { persons: [] }
  if (!message) return out
  return { ...out, error: { message } }
}

function calculateAge(birthDate: Date, referenceDate: Date) {
  let age = referenceDate.getFullYear() - birthDate.getFullYear()
  const m = referenceDate.getMonth() - birthDate.getMonth()

  if (m < 0 || (m === 0 && referenceDate.getDate() < birthDate.getDate())) {
    age -= 1
  }
  return age === 1 ? '1yr' : `${age}yrs`
}

function transform(person: XmlPerson, options?: { relativeDate?: Date | null }): Person {
  const { first, last, dob } = person.$

  let referenceDate: Date
  if (options?.relativeDate) {
    referenceDate = options.relativeDate
  } else if (dob) {
    referenceDate = new Date(dob)
  } else {
    referenceDate = new Date()
  }

  const formattedAge = dob ? ` (${calculateAge(new Date(dob), referenceDate)})` : ''

  return {
    first,
    last,
    full: `${first} ${last}`,
    display: `${first} ${last}${formattedAge}`,
    dob,
  }
}

function transformJsonSchema(xml: XmlPersons, ageRelativeDate: Date | null): Person[] {
  const personOptions = { relativeDate: ageRelativeDate }
  if (Array.isArray(xml.persons.person)) {
    return xml.persons.person.map((p) => transform(p, personOptions))
  }
  return [transform(xml.persons.person, personOptions)]
}

export default transformJsonSchema
export { transform }
