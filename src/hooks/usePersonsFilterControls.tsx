'use client'

import { useCallback, useMemo } from 'react'

import { isSearchOnlyPersonCandidate } from '../lib/domains/keywords'
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
  selectedPerson,
  setSelectedPerson,
}: {
  items: ItemType[]
  keywordFromUrl: string
  selectedPerson: string | null
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

  const effectiveSelectedPerson = selectedPerson ?? inferredPersonDetailsName

  return {
    effectiveSelectedPerson,
    handleStructuredOptionSubmit,
    inferredPersonDetailsName,
  }
}
