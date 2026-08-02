export type PersonCount = {
  name: string
  count: number
}

export type PersonOption = {
  label: string
  value: string
  count: number
}

type PersonCountableItem = {
  persons?: { full: string }[] | null
}

export function buildPersonCountsFromItems<ItemType extends PersonCountableItem>(items: ItemType[], limit: number) {
  const counts = new Map<string, number>()

  items.flatMap(item => item.persons?.map(person => person.full) ?? [])
    .filter(Boolean)
    .forEach((name) => {
      counts.set(name, (counts.get(name) ?? 0) + 1)
    })

  return [...counts.entries()]
    .sort((left, right) => right[1] - left[1])
    .slice(0, limit)
    .map(([name, count]) => ({ name, count }))
}

export function buildPersonOptions(personCounts: PersonCount[]): PersonOption[] {
  return personCounts.map(({ name, count }) => ({
    label: `${name} (${count})`,
    value: name,
    count,
  }))
}
