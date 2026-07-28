'use client'

import { useCallback, useMemo } from 'react'

import RemovableFilterChip from '../components/Search/RemovableFilterChip'
import { isSearchOnlyPersonCandidate } from '../lib/domains/keywords'
import type { PersonAgeFilterValue } from '../lib/persons'
import { classifySearchSelection } from '../lib/search-submit-intent'
import type { IndexedKeywords } from '../types/common'

type PersonSearchItem = {
  persons?: Array<{ full: string }> | null
  search?: string | null
}

function uniqueValues(values: string[]) {
  return [...new Set(values.map(value => value.trim()).filter(Boolean))]
}

export default function usePersonsFilterControls<ItemType extends PersonSearchItem>({
  items,
  keywordFromUrl,
  selectedAge,
  selectedPerson,
  setSelectedAge,
  setSelectedPerson,
}: {
  items: ItemType[]
  keywordFromUrl: string
  selectedAge: PersonAgeFilterValue
  selectedPerson: string | null
  setSelectedAge: (value: PersonAgeFilterValue) => void
  setSelectedPerson: (value: string | null) => void
}) {
  const knownPeople = useMemo(() => uniqueValues([
    ...items.flatMap(item => item.persons?.map(person => person.full) ?? []),
    ...items.flatMap(item => item.search
      ?.split(', ')
      .map(token => token.trim())
      .filter(token => isSearchOnlyPersonCandidate(token)) ?? []),
  ]), [items])

  const inferredPersonDetailsName = useMemo(
    () => {
      const classification = classifySearchSelection({
        inputValue: keywordFromUrl,
        knownPeople,
        personMatchMode: 'unique-contains',
      })

      return classification.kind === 'person' ? classification.value : null
    },
    [knownPeople, keywordFromUrl],
  )

  const handleStructuredOptionSubmit = useCallback((option: IndexedKeywords) => {
    const classification = classifySearchSelection({
      selectedOption: option,
      inputValue: option.value,
      knownPeople,
      personMatchMode: 'unique-contains',
    })

    if (classification.kind !== 'person') {
      return false
    }

    setSelectedPerson(classification.value)
    return true
  }, [knownPeople, setSelectedPerson])

  const hasActivePersonFilters = selectedAge !== null || selectedPerson !== null
  const effectiveSelectedPerson = selectedPerson ?? inferredPersonDetailsName

  const extraFilterChips = useMemo(() => {
    if (!hasActivePersonFilters) {
      return null
    }

    return (
      <>
        {selectedAge !== null && (
          <RemovableFilterChip
            label={`Age: ${selectedAge === 'unknown' ? 'Unknown' : selectedAge}`}
            onRemove={() => setSelectedAge(null)}
            removeTitle="Clear age filter"
          />
        )}
        {selectedPerson && (
          <RemovableFilterChip
            label={`Person: ${selectedPerson}`}
            onRemove={() => setSelectedPerson(null)}
            removeTitle="Clear person filter"
          />
        )}
      </>
    )
  }, [hasActivePersonFilters, selectedAge, selectedPerson, setSelectedAge, setSelectedPerson])

  return {
    effectiveSelectedPerson,
    extraFilterChips,
    handleStructuredOptionSubmit,
    hasActivePersonFilters,
    inferredPersonDetailsName,
  }
}
