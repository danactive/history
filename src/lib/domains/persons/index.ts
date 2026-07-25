import type { ServerSideAllItem } from '../../../types/common'
import { calcAgeAtDate, resolvePhotoDate } from '../../../utils/person-age'
import { countValuesByFrequency } from '../../storytelling-ranking'

export type PersonAgeFilterValue = number | 'unknown' | null

export type PersonCount = {
  name: string
  count: number
}

export type PersonOption = {
  label: string
  value: string
  count: number
}

type PersonBearingItem = {
  persons?: { full: string }[] | null
}

export function buildPersonCountsFromItems<ItemType extends PersonBearingItem>(items: ItemType[], limit: number) {
  return countValuesByFrequency(
    items.flatMap(item => item.persons?.map(person => person.full) ?? []),
    limit,
  )
}

export function buildPersonOptions(personCounts: PersonCount[]): PersonOption[] {
  return personCounts.map(({ name, count }) => ({
    label: `${name} (${count})`,
    value: name,
    count,
  }))
}

export function filterPersonsItems(
  items: ServerSideAllItem[],
  selectedAge: PersonAgeFilterValue,
  selectedPerson: string | null,
) {
  const personFilteredItems = selectedPerson
    ? items.filter((item) => item.persons?.some((person) => person.full === selectedPerson))
    : items

  if (selectedAge === null) {
    return personFilteredItems
  }

  return personFilteredItems.filter((item) => {
    if (!item.persons || !item.filename) {
      return false
    }

    const photoDate = resolvePhotoDate(item)
    return item.persons.some((person) => {
      if (selectedPerson && person.full !== selectedPerson) {
        return false
      }

      const age = 'dob' in person && person.dob ? calcAgeAtDate(person.dob, photoDate) : 'unknown'
      return age === selectedAge
    })
  })
}
