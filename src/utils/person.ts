import { Item } from '../types/common'

function calculateAge(birthDate: Date, referenceDate: Date) {
  // Check if the date is valid by verifying the full year
  if (Number.isNaN(birthDate.getFullYear()) || Number.isNaN(referenceDate.getFullYear())) {
    return null
  }

  let age = referenceDate.getFullYear() - birthDate.getFullYear()
  const monthsDifference = referenceDate.getMonth() - birthDate.getMonth()

  // Check if the month is invalid
  if (Number.isNaN(birthDate.getMonth()) || Number.isNaN(referenceDate.getMonth())) {
    return `~${age}`
  }

  if (monthsDifference < 0 || (monthsDifference === 0 && referenceDate.getDate() < birthDate.getDate())) {
    age -= 1
  }
  return age === 1 ? '1yr' : `${age}yrs`
}

function calculateAgeByYear(birthDate: Date, referenceYear: string) {
  const age = Number(referenceYear) - birthDate.getFullYear()
  return age === 1 ? '~1yr' : `~${age.toString()}yrs`
}

function applyAge(persons: Item['persons'], filename: Item['filename']) {
  if (!persons) {
    return ''
  }
  const firstFilename = Array.isArray(filename) ? filename[0] : filename
  const filenamePossibleDate = firstFilename.substring(0, 10)

  const possibleFilenameYear = filenamePossibleDate.substring(0, 4)
  const validYearPattern = /^(18|19|20|21)\d{2}$/

  const invalidYear = !validYearPattern.test(possibleFilenameYear)
  if (invalidYear) {
    return persons.map((person) => person.full).join(', ')
  }

  const possibleFilenameMonth = filenamePossibleDate.substring(5, 7)
  const validMonthPattern = /^(0[1-9]|1[0-2])$/
  const validMonth = validMonthPattern.test(possibleFilenameMonth)
  const referenceDate = new Date(filenamePossibleDate)

  return persons.map((person) => {
    let age: string | null = null
    if (person.dob) {
      const possibleDobMonth = person.dob.substring(5, 7)
      const validDobMonth = validMonthPattern.test(possibleDobMonth)
      if (validMonth && validDobMonth) {
        age = calculateAge(new Date(person.dob), referenceDate)
      } else {
        const birthdate = (validDobMonth) ? new Date(person.dob) : new Date(`${person.dob}-01-02`)
        age = calculateAgeByYear(birthdate, possibleFilenameYear)
      }
    }
    const formattedAge = age ? ` (${age})` : ''
    return `${person.full}${formattedAge}`
  }).join(', ')
}

export default applyAge
