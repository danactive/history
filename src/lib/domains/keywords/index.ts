import type { IndexedKeywords } from '../../../types/common'
import { isYearToken } from '../years'

type CountEntry = {
  name: string
  count: number
}

export function isTagKeyword(value: string) {
  return value.trim().endsWith('^')
}

export function hasPersonLikeCasing(value: string) {
  return /^[A-Z][A-Za-z'-]+(?: [A-Z][A-Za-z'-]+)+$/.test(value.trim())
}

export function isSearchOnlyPersonCandidate(
  value: string,
  options: {
    knownPeople?: Iterable<string>
    reservedValues?: Iterable<string>
  } = {},
) {
  const trimmed = value.trim()
  const knownPeople = new Set(options.knownPeople ?? [])
  const reservedValues = new Set(options.reservedValues ?? [])

  return trimmed.length > 0
    && !knownPeople.has(trimmed)
    && !reservedValues.has(trimmed)
    && !isTagKeyword(trimmed)
    && !isYearToken(trimmed)
    && hasPersonLikeCasing(trimmed)
}

export function splitIndexedKeywords(
  indexedKeywords: IndexedKeywords[],
  reservedValues: Iterable<string> = [],
) {
  const reserved = new Set(reservedValues)

  return indexedKeywords.reduce<{
    yearOptions: IndexedKeywords[]
    tagOptions: IndexedKeywords[]
    otherOptions: IndexedKeywords[]
  }>((acc, option) => {
    if (isYearToken(option.value)) {
      acc.yearOptions.push(option)
      return acc
    }

    if (isTagKeyword(option.value)) {
      acc.tagOptions.push(option)
      return acc
    }

    if (!reserved.has(option.value)) {
      acc.otherOptions.push(option)
    }

    return acc
  }, {
    yearOptions: [],
    tagOptions: [],
    otherOptions: [],
  })
}

export function filterSearchOnlyPersonCounts(
  counts: CountEntry[],
  options: {
    knownPeople?: Iterable<string>
    reservedValues?: Iterable<string>
  } = {},
) {
  return counts.filter(({ name, count }) => count > 0 && isSearchOnlyPersonCandidate(name, options))
}
