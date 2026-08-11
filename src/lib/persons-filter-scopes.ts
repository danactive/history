import type { ServerSideAllItem } from '../types/common'
import type { PersonAgeFilterValue } from './domains/persons'
import { calcAgeAtDate, resolvePhotoDate } from '../utils/person-age'

export type PeopleAtSelectedAgeCount = {
  name: string
  count: number
}

type PersonMatch = {
  name: string
  age: number | 'unknown'
  photoDate: string
}

export function matchesSelectedPersonAge(
  item: ServerSideAllItem,
  selectedAge: PersonAgeFilterValue,
  selectedPerson: string | null,
) {
  if (!item.persons || !item.filename) {
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

export function getServerScopedPerson(selectedAge: PersonAgeFilterValue, selectedPerson: string | null) {
  return selectedAge === null ? selectedPerson : null
}

export function getAgeSummaryPerson(_selectedAge: PersonAgeFilterValue, effectiveSelectedPerson: string | null) {
  return _selectedAge === null ? effectiveSelectedPerson : null
}

export function derivePersonsScopes({
  items,
  selectedAge,
  effectiveSelectedPerson,
  canReuseServerScope,
}: {
  items: ServerSideAllItem[]
  selectedAge: PersonAgeFilterValue
  effectiveSelectedPerson: string | null
  canReuseServerScope: boolean
}) {
  const ageSummaryPerson = getAgeSummaryPerson(selectedAge, effectiveSelectedPerson)

  const ageSummaryItems = canReuseServerScope
    ? items
    : ageSummaryPerson
      ? items.filter((item) => item.persons?.some((person) => person.full === ageSummaryPerson))
      : items

  const ageBaseFiltered = canReuseServerScope || selectedAge === null
    ? items
    : items.filter((item) => {
      if (!item.persons || !item.filename) return false
      const photoDate = resolvePhotoDate(item)
      return item.persons.some((person) => {
        const age = person.dob ? calcAgeAtDate(person.dob, photoDate) : 'unknown'
        return age === selectedAge
      })
    })

  const ageFiltered = canReuseServerScope || !effectiveSelectedPerson
    ? ageBaseFiltered
    : ageBaseFiltered.filter((item) => matchesSelectedPersonAge(item, selectedAge, effectiveSelectedPerson))

  return {
    ageSummaryPerson,
    ageSummaryItems,
    ageBaseFiltered,
    ageFiltered,
  }
}

export function derivePeopleAtSelectedAge(items: ServerSideAllItem[], selectedAge: PersonAgeFilterValue) {
  if (selectedAge === null) {
    const counts = new Map<string, number>()

    items.forEach((item) => {
      item.persons?.forEach((person) => {
        counts.set(person.full, (counts.get(person.full) || 0) + 1)
      })
    })

    const peopleAtSelectedAge = Array.from(counts.keys()).sort()

    return {
      peopleAtSelectedAge,
      peopleWithCounts: peopleAtSelectedAge
        .map((name) => ({ name, count: counts.get(name) || 0 }))
        .sort((left, right) => (right.count - left.count) || left.name.localeCompare(right.name)),
    }
  }

  const matches: PersonMatch[] = []
  const counts = new Map<string, number>()

  items.forEach((item) => {
    if (!item.persons || !item.filename) return
    const photoDate = resolvePhotoDate(item)
    item.persons.forEach((person) => {
      const age = person.dob ? calcAgeAtDate(person.dob, photoDate) : 'unknown'
      if (age === selectedAge) {
        matches.push({ name: person.full, age, photoDate })
        counts.set(person.full, (counts.get(person.full) || 0) + 1)
      }
    })
  })

  const uniquePeople = Array.from(
    matches.reduce((acc, match) => {
      if (!acc.has(match.name) || acc.get(match.name)!.photoDate > match.photoDate) {
        acc.set(match.name, match)
      }
      return acc
    }, new Map<string, PersonMatch>()),
  ).map(([_, match]) => match.name).sort()

  return {
    peopleAtSelectedAge: uniquePeople,
    peopleWithCounts: uniquePeople
      .map((name) => ({ name, count: counts.get(name) || 0 }))
      .sort((left, right) => (right.count - left.count) || left.name.localeCompare(right.name)),
  }
}
