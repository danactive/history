import type { ServerSideAllItem } from '../../../types/common'
import { calcAgeAtDate, resolvePhotoDate } from '../../../utils/person-age'
import { filterItemsBySelectedPerson } from '../../filter-selected-person'
export {
  buildPersonCountsFromItems,
  buildPersonOptions,
  type PersonCount,
  type PersonOption,
} from './metadata'

export type PersonAgeFilterValue = number | 'unknown' | null

export function filterPersonsItems(
  items: ServerSideAllItem[],
  selectedAge: PersonAgeFilterValue,
  selectedPerson: string | null,
) {
  if (typeof selectedAge === 'number' && selectedAge < 0) {
    return []
  }

  const personFilteredItems = filterItemsBySelectedPerson(items, selectedPerson)

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
