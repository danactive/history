'use client'

import { useEffect, useMemo } from 'react'

import { derivePersonsAgeSummary } from '../lib/persons-age-summary'
import type { PersonAgeFilterValue } from '../lib/persons'
import {
  derivePeopleAtSelectedAge,
  derivePersonsScopes,
  matchesSelectedPersonAge,
} from '../lib/persons-filter-scopes'
import type { ServerSideAllItem } from '../types/common'
import type { AgeSummaryValue } from '../utils/person-age'

export default function usePersonsDerivedData({
  itemsToShow,
  selectedAge,
  effectiveSelectedPerson,
  initialSelectedAge,
  initialSelectedPerson,
  initialBaseScopeItems,
  initialAgeScopeItems,
  initialPersonScopeItems,
  isServerScopeCurrent,
  keyword,
  mapFilterEnabled,
  initialAgeSummary,
  setSelectedAge,
}: {
  itemsToShow: ServerSideAllItem[]
  selectedAge: PersonAgeFilterValue
  effectiveSelectedPerson: string | null
  initialSelectedAge: PersonAgeFilterValue
  initialSelectedPerson: string | null
  initialBaseScopeItems?: ServerSideAllItem[]
  initialAgeScopeItems?: ServerSideAllItem[]
  initialPersonScopeItems?: ServerSideAllItem[]
  isServerScopeCurrent: boolean
  keyword: string
  mapFilterEnabled: boolean
  initialAgeSummary?: { ages: { age: AgeSummaryValue; count: number }[]; totalPhotoCount?: number }
  setSelectedAge: (value: PersonAgeFilterValue) => void
}) {
  const scopedItems = useMemo(() => {
    const canUseInitialBaseScope = selectedAge !== null
      && initialSelectedAge === null
      && initialSelectedPerson !== null
      && effectiveSelectedPerson === initialSelectedPerson
      && initialBaseScopeItems !== undefined

    const canUseInitialAgeScope = selectedAge !== null
      && selectedAge === initialSelectedAge
      && initialSelectedPerson !== null
      && initialAgeScopeItems !== undefined

    const canUseInitialPersonScope = selectedAge === null
      && effectiveSelectedPerson !== null
      && effectiveSelectedPerson === initialSelectedPerson
      && initialPersonScopeItems !== undefined

    if (canUseInitialBaseScope) {
      return initialBaseScopeItems
    }

    if (canUseInitialAgeScope) {
      return initialAgeScopeItems
    }

    return canUseInitialPersonScope ? initialPersonScopeItems : itemsToShow
  }, [
    effectiveSelectedPerson,
    initialAgeScopeItems,
    initialBaseScopeItems,
    initialPersonScopeItems,
    initialSelectedAge,
    initialSelectedPerson,
    itemsToShow,
    selectedAge,
  ])

  const currentServerScopedItems = useMemo(() => {
    if (!isServerScopeCurrent) {
      return null
    }

    return scopedItems.filter((item) => matchesSelectedPersonAge(item, selectedAge, effectiveSelectedPerson))
  }, [effectiveSelectedPerson, isServerScopeCurrent, scopedItems, selectedAge])

  const canReuseServerScope = scopedItems === itemsToShow
    && isServerScopeCurrent
    && currentServerScopedItems !== null
    && currentServerScopedItems.length === itemsToShow.length
    && currentServerScopedItems.every((item, index) => item.id === itemsToShow[index]?.id)
  const canReuseServerSummary = initialAgeSummary !== undefined
    && !keyword
    && !mapFilterEnabled
    && (selectedAge !== null || effectiveSelectedPerson === initialSelectedPerson)

  const {
    ageSummaryPerson,
    ageSummaryItems,
    ageBaseFiltered,
    ageFiltered,
  } = useMemo(() => derivePersonsScopes({
    items: scopedItems,
    selectedAge,
    effectiveSelectedPerson,
    canReuseServerScope,
  }), [canReuseServerScope, effectiveSelectedPerson, scopedItems, selectedAge])

  const {
    agesWithCounts,
    hasUnknown,
    numericAges,
    totalPhotoCount,
  } = useMemo(() => derivePersonsAgeSummary({
    ageSummaryItems,
    ageSummaryPerson,
    canReuseServerSummary,
    initialAgeSummary,
  }), [ageSummaryItems, ageSummaryPerson, canReuseServerSummary, initialAgeSummary])

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

  const { peopleAtSelectedAge, peopleWithCounts } = useMemo(
    () => derivePeopleAtSelectedAge(ageBaseFiltered, selectedAge),
    [ageBaseFiltered, selectedAge],
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
    peopleAtSelectedAge,
    peopleWithCounts,
    totalPhotoCount,
  }
}
