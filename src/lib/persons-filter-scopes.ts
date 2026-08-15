import type { ServerSideAllItem } from '../types/common'
import type { PersonAgeFilterValue } from './domains/persons'
import { calcAgeAtDate, resolvePhotoDate } from '../utils/person-age'

export type PersonCount = {
  name: string
  count: number
}

export function matchesSelectedPersonAge(
  item: ServerSideAllItem,
  selectedAge: PersonAgeFilterValue,
  selectedPerson: string | null,
) {
  if (!item.persons || !item.filename) {
    return false
  }

  if (typeof selectedAge === 'number' && selectedAge < 0) {
    return false
  }

  const photoDate = resolvePhotoDate(item)
  return item.persons.some((person) => {
    if (selectedPerson && person.full !== selectedPerson) {
      return false
    }

    if (selectedAge === null) {
      return true
    }

    const age = person.dob ? calcAgeAtDate(person.dob, photoDate) : 'unknown'
    return age === selectedAge
  })
}

export function derivePersonsScopes({
  items,
  selectedAge,
  effectiveSelectedPerson,
}: {
  items: ServerSideAllItem[]
  selectedAge: PersonAgeFilterValue
  effectiveSelectedPerson: string | null
}) {
  if (typeof selectedAge === 'number' && selectedAge < 0) {
    return { ageBaseFiltered: [], ageFiltered: [] }
  }

  const ageBaseFiltered = selectedAge === null
    ? items
    : items.filter((item) => {
      if (!item.persons || !item.filename) return false
      const photoDate = resolvePhotoDate(item)
      return item.persons.some((person) => {
        const age = person.dob ? calcAgeAtDate(person.dob, photoDate) : 'unknown'
        return age === selectedAge
      })
    })

  const ageFiltered = !effectiveSelectedPerson
    ? ageBaseFiltered
    : ageBaseFiltered.filter((item) => matchesSelectedPersonAge(item, selectedAge, effectiveSelectedPerson))

  return {
    ageBaseFiltered,
    ageFiltered,
  }
}

export function derivePeople(
  items: ServerSideAllItem[],
  selectedAge: PersonAgeFilterValue = null,
) {
  const counts = new Map<string, number>()

  items.forEach((item) => {
    if (selectedAge !== null && !item.filename) {
      return
    }

    const photoDate = selectedAge === null ? null : resolvePhotoDate(item)
    item.persons?.forEach((person) => {
      if (selectedAge !== null) {
        const age = person.dob ? calcAgeAtDate(person.dob, photoDate!) : 'unknown'
        if (age !== selectedAge) {
          return
        }
      }

      counts.set(person.full, (counts.get(person.full) || 0) + 1)
    })
  })

  const people = Array.from(counts.keys()).sort()

  return {
    people,
    peopleWithCounts: people
      .map((name) => ({ name, count: counts.get(name) || 0 }))
      .sort((left, right) => (right.count - left.count) || left.name.localeCompare(right.name)),
  }
}
