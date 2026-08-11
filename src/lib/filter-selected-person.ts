type PersonBearingItem = {
  persons?: { full: string }[] | null
  search?: string | null
  corpus?: string | null
}

function normalizePersonName(value: string) {
  return value.trim().toLowerCase()
}

export function filterItemsBySelectedPerson<ItemType extends PersonBearingItem>(
  items: ItemType[],
  selectedPerson: string | null,
) {
  if (!selectedPerson) {
    return items
  }

  const normalizedPerson = normalizePersonName(selectedPerson)

  return items.filter((item) => {
    if (item.persons?.length) {
      return item.persons.some((person) => normalizePersonName(person.full) === normalizedPerson)
    }

    return [item.search, item.corpus].some((value) => value?.toLowerCase().includes(normalizedPerson))
  })
}
