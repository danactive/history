'use client'

import { useMemo } from 'react'
import { filterItemsByMapBounds, type Bounds } from '../lib/map-filtering'

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
  mapBounds,
  initialAgeSummary,
}: {
  itemsToShow: ServerSideAllItem[]
  selectedAge: PersonAgeFilterValue
  effectiveSelectedPerson: string | null
  initialBaseScopeItems?: ServerSideAllItem[]
  initialSelectedPerson: string | null
  isServerScopeCurrent: boolean
  mapFilterEnabled: boolean
  mapBounds?: Bounds | null
  initialAgeSummary?: { ages: { age: AgeSummaryValue; count: number }[]; totalPhotoCount?: number }
}) {
  const baseItems = initialBaseScopeItems ?? itemsToShow
  const scopedItems = useMemo(
    () => filterItemsByMapBounds(baseItems, mapFilterEnabled, mapBounds ?? null),
    [baseItems, mapFilterEnabled, mapBounds],
  )
  const canReuseServerSummary = initialAgeSummary !== undefined
    && initialBaseScopeItems === undefined
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
    totalPhotoCount,
  } = useMemo(() => derivePersonsAgeSummary({
    ageSummaryItems,
    selectedPerson: effectiveSelectedPerson,
    canReuseServerSummary,
    initialAgeSummary,
  }), [ageSummaryItems, effectiveSelectedPerson, canReuseServerSummary, initialAgeSummary])

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
