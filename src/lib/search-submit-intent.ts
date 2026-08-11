import type { IndexedKeywords, VisitedPlace } from '../types/common'
import { isTagKeyword } from './domains/keywords'
import { isYearToken } from './domains/years'

export type SearchSelectionKind = 'visited' | 'person' | 'tag' | 'year' | 'keyword'

export type SearchSelectionClassification =
  | { kind: 'visited'; visitedPlace: VisitedPlace; option: IndexedKeywords }
  | { kind: 'person'; value: string; option?: IndexedKeywords }
  | { kind: 'tag'; value: string; option?: IndexedKeywords }
  | { kind: 'year'; value: string; option?: IndexedKeywords }
  | { kind: 'keyword'; value: string; option?: IndexedKeywords }
  | { kind: 'noop' }

function resolveKnownPerson(
  value: string,
  knownPeople: string[],
  matchMode: 'exact' | 'unique-contains',
) {
  const normalizedValue = value.trim().toLowerCase()
  const exactMatch = knownPeople.find(person => person.trim().toLowerCase() === normalizedValue)
  if (exactMatch || matchMode === 'exact') {
    return exactMatch ?? null
  }

  const partialMatches = knownPeople.filter(person => person.trim().toLowerCase().includes(normalizedValue))
  return partialMatches.length === 1 ? partialMatches[0] ?? null : null
}

function isImplicitScalarFilterValue(value: string) {
  const trimmed = value.trim()
  return trimmed.length > 0
    && !/[()]/.test(trimmed)
    && !trimmed.includes('&&')
    && !trimmed.includes('||')
    && !/\s/.test(trimmed)
}

export function classifySearchSelection({
  selectedOption,
  inputValue,
  knownPeople = [],
  knownTags = [],
  personMatchMode = 'exact',
}: {
  selectedOption?: IndexedKeywords | null
  inputValue: string
  knownPeople?: string[]
  knownTags?: string[]
  personMatchMode?: 'exact' | 'unique-contains'
}): SearchSelectionClassification {
  if (selectedOption?.visitedPlace) {
    return {
      kind: 'visited',
      visitedPlace: selectedOption.visitedPlace,
      option: selectedOption,
    }
  }

  const value = (selectedOption?.value ?? inputValue).trim()
  if (!value) {
    return { kind: 'noop' }
  }

  if (selectedOption?.filterKind === 'person') {
    return {
      kind: 'person',
      value: resolveKnownPerson(value, knownPeople, personMatchMode) ?? value,
      option: selectedOption,
    }
  }

  if (
    selectedOption?.filterKind === 'tag'
    || knownTags.includes(value)
    || (isImplicitScalarFilterValue(value) && isTagKeyword(value))
  ) {
    return { kind: 'tag', value, option: selectedOption ?? undefined }
  }

  if (selectedOption?.filterKind === 'year' || (isImplicitScalarFilterValue(value) && isYearToken(value))) {
    return { kind: 'year', value, option: selectedOption ?? undefined }
  }

  const knownPerson = resolveKnownPerson(value, knownPeople, personMatchMode)
  if (knownPerson) {
    return { kind: 'person', value: knownPerson, option: selectedOption ?? undefined }
  }

  return { kind: 'keyword', value, option: selectedOption ?? undefined }
}

export type SearchSubmitIntent =
  | { type: 'visited'; visitedPlace: VisitedPlace }
  | { type: 'person'; person: string; option?: IndexedKeywords }
  | { type: 'tag'; tag: string; option?: IndexedKeywords }
  | { type: 'year'; year: string; option?: IndexedKeywords }
  | { type: 'structured'; option: IndexedKeywords }
  | { type: 'keyword'; keyword: string }
  | { type: 'noop' }

export function resolveSearchSubmitIntent({
  selectedOption,
  inputValue,
  knownPeople,
  knownTags,
  personMatchMode,
}: {
  selectedOption: IndexedKeywords | null
  inputValue: string
  knownPeople?: string[]
  knownTags?: string[]
  personMatchMode?: 'exact' | 'unique-contains'
}): SearchSubmitIntent {
  const classification = classifySearchSelection({
    selectedOption,
    inputValue,
    knownPeople,
    knownTags,
    personMatchMode,
  })

  if (classification.kind === 'visited') {
    return {
      type: 'visited',
      visitedPlace: classification.visitedPlace,
    }
  }

  if (classification.kind === 'person') {
    return {
      type: 'person',
      person: classification.value,
      option: classification.option,
    }
  }

  if (classification.kind === 'tag') {
    return {
      type: 'tag',
      tag: classification.value,
      option: classification.option,
    }
  }

  if (classification.kind === 'year') {
    return {
      type: 'year',
      year: classification.value,
      option: classification.option,
    }
  }

  if (selectedOption && !selectedOption.isCreateOption && !selectedOption.filterKind) {
    return {
      type: 'structured',
      option: selectedOption,
    }
  }

  if (classification.kind === 'noop') {
    return { type: 'noop' }
  }

  return {
    type: 'keyword',
    keyword: classification.value,
  }
}
