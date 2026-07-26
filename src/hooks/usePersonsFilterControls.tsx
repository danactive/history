'use client'

import { useCallback, useMemo } from 'react'

import RemovableFilterChip from '../components/Search/RemovableFilterChip'
import type { PersonAgeFilterValue } from '../lib/persons'
import { resolveUniquePersonName } from '../utils/person-search'

type PersonSearchItem = {
  persons?: Array<{ full: string }> | null
  search?: string | null
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
  const inferredPersonDetailsName = useMemo(
    () => resolveUniquePersonName(items, keywordFromUrl),
    [items, keywordFromUrl],
  )

  const handleStructuredOptionSubmit = useCallback((option: { value: string }) => {
    const resolvedPerson = resolveUniquePersonName(items, option.value)
    if (!resolvedPerson) {
      return false
    }

    setSelectedPerson(resolvedPerson)
    return true
  }, [items, setSelectedPerson])

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
