'use client'

import { useEffect, useMemo } from 'react'

import { derivePersonsAgeSummary } from '../lib/persons-age-summary'
import type { PersonAgeFilterValue } from '../lib/persons'
import {
  derivePeople,
  derivePersonsScopes,
} from '../lib/persons-filter-scopes'
import type { ServerSideAllItem } from '../types/common'
import type { AgeSummaryValue } from '../utils/person-age'

export default function usePersonsDerivedData({
  itemsToShow,
  selectedAge,
  effectiveSelectedPerson,
  initialBaseScopeItems,
  initialSelectedPerson,
  isServerScopeCurrent,
  mapFilterEnabled,
  initialAgeSummary,
  setSelectedAge,
}: {
  itemsToShow: ServerSideAllItem[]
  selectedAge: PersonAgeFilterValue
  effectiveSelectedPerson: string | null
  initialBaseScopeItems?: ServerSideAllItem[]
  initialSelectedPerson: string | null
  isServerScopeCurrent: boolean
  mapFilterEnabled: boolean
  initialAgeSummary?: { ages: { age: AgeSummaryValue; count: number }[]; totalPhotoCount?: number }
  setSelectedAge: (value: PersonAgeFilterValue) => void
}) {
  const scopedItems = initialBaseScopeItems ?? itemsToShow
  const canReuseServerSummary = initialAgeSummary !== undefined
    && isServerScopeCurrent
    && !mapFilterEnabled
    && effectiveSelectedPerson === initialSelectedPerson

  const {
    ageFiltered,
  } = useMemo(() => derivePersonsScopes({
    items: scopedItems,
    selectedAge,
    effectiveSelectedPerson,
  }), [effectiveSelectedPerson, scopedItems, selectedAge])

  const ageSummaryItems = useMemo(
    () => effectiveSelectedPerson
      ? scopedItems.filter((item) => item.persons?.some((person) => person.full === effectiveSelectedPerson))
      : scopedItems,
    [effectiveSelectedPerson, scopedItems],
  )

  const {
    agesWithCounts,
    hasUnknown,
    numericAges,
    totalPhotoCount,
  } = useMemo(() => derivePersonsAgeSummary({
    ageSummaryItems,
    selectedPerson: effectiveSelectedPerson,
    canReuseServerSummary,
    initialAgeSummary,
  }), [ageSummaryItems, effectiveSelectedPerson, canReuseServerSummary, initialAgeSummary])

  useEffect(() => {
    if (!isServerScopeCurrent) {
      return
    }

    const selectedMissing = selectedAge === 'unknown'
      ? !hasUnknown
      : selectedAge !== null && !numericAges.includes(selectedAge)

    if (selectedMissing) {
      setSelectedAge(null)
    }
  }, [hasUnknown, isServerScopeCurrent, numericAges, selectedAge, setSelectedAge])

  const { people, peopleWithCounts } = useMemo(
    () => derivePeople(scopedItems, selectedAge),
    [scopedItems, selectedAge],
  )

  const itemsWithCorpus: ServerSideAllItem[] = useMemo(
    () => ageFiltered.map((item) => ({
      ...item,
      coordinateAccuracy: item.coordinateAccuracy ?? 0,
      visitedPlace: item.visitedPlace ?? null,
    })),
    [ageFiltered],
  )

  return {
    ageFiltered,
    agesWithCounts,
    itemsWithCorpus,
    people,
    peopleWithCounts,
    totalPhotoCount,
  }
}
