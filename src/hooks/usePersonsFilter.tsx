'use client'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import type { FilterControlsProps } from '../components/Persons/FilterControls'
import type { Gallery, ServerSideAllItem } from '../types/common'
import type { All } from '../types/pages'
import type { PersonAgeFilterValue } from '../lib/persons'
import { resolveUniquePersonName } from '../utils/person-search'
import { type AgeSummaryValue, calcAgeAtDate, resolvePhotoDate } from '../utils/person-age'
import useMapFilter from './useMapFilter'
import useMemory from './useMemory'

type PersonMatch = {
  name: string
  age: number | 'unknown'
  photoDate: string
}

function matchesSelectedPersonAge(
  item: ServerSideAllItem,
  selectedAge: PersonAgeFilterValue,
  selectedPerson: string | null,
) {
  if (!item.persons || !item.filename) {
    return false
  }

  const photoDate = resolvePhotoDate(item)
  return item.persons.some((person) => {
    if (selectedPerson && person.full !== selectedPerson) {
      return false
    }

    if (selectedAge === null) {
      return true
    }

    const age = person.dob ? calcAgeAtDate(person.dob, photoDate) : 'unknown'
    return age === selectedAge
  })
}

export default function usePersonsFilter({
  gallery,
  items,
  totalItemCount,
  indexedKeywords,
  initialAgeSummary,
  initialSelectedAge,
  initialSelectedPerson,
}: All.ItemData & {
  gallery: Gallery
  totalItemCount?: number
  initialAgeSummary?: { ages: { age: AgeSummaryValue; count: number }[] }
  initialSelectedAge?: PersonAgeFilterValue
  initialSelectedPerson?: string | null
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const resolvedInitialAge = initialSelectedAge ?? null
  const resolvedInitialPerson = initialSelectedPerson ?? null

  // Age/person selection state
  const [selectedAge, setSelectedAge] = useState<PersonAgeFilterValue>(resolvedInitialAge)
  const [selectedPerson, setSelectedPerson] = useState<string | null>(resolvedInitialPerson)
  const isServerScopeCurrent = selectedAge === resolvedInitialAge && selectedPerson === resolvedInitialPerson
  const hasVisitedFilter = Boolean(searchParams.get('visitedCountry'))

  const keywordFromUrl = searchParams.get('keyword') ?? ''
  const inferredPersonDetailsName = useMemo(() => {
    return resolveUniquePersonName(items, keywordFromUrl)
  }, [items, keywordFromUrl])
  const effectiveSelectedPerson = selectedPerson ?? inferredPersonDetailsName

  const {
    refImageGallery,
    memoryIndex,
    setMemoryIndex,
    memoryHtml,
    viewedList,
    keyword,
    searchBox,
    mapFilterEnabled,
    handleToggleMapFilter,
    handleBoundsChange,
    itemsToShow,
    isClearing,
    clearCoordinates,
  } = useMapFilter({
    gallery,
    items,
    totalCount: totalItemCount,
    indexedKeywords,
    personDetailsName: effectiveSelectedPerson,
  })

  const currentServerScopedItems = useMemo(() => {
    if (!isServerScopeCurrent) {
      return null
    }

    return itemsToShow.filter((item) => matchesSelectedPersonAge(item, selectedAge, effectiveSelectedPerson))
  }, [effectiveSelectedPerson, isServerScopeCurrent, itemsToShow, selectedAge])

  const canReuseServerScope = isServerScopeCurrent
    && currentServerScopedItems !== null
    && currentServerScopedItems.length === itemsToShow.length
  const canReuseServerSummary = canReuseServerScope
    && !hasVisitedFilter
    && !keyword
    && !mapFilterEnabled

  // Keep local state in sync when URL changes externally (navigation/back/forward/share links).
  useEffect(() => {
    const ageParam = searchParams.get('age')
    const parsedAge = ageParam ? Number.parseInt(ageParam, 10) : null
    const ageFromUrl: PersonAgeFilterValue = ageParam === 'unknown'
      ? 'unknown'
      : (Number.isNaN(parsedAge) ? null : parsedAge)
    const personFromUrl = searchParams.get('person')

    setSelectedAge(prev => (prev === ageFromUrl ? prev : ageFromUrl))
    setSelectedPerson(prev => (prev === personFromUrl ? prev : personFromUrl))
  }, [searchParams])

  // Persist selected age/person to URL so filtered views are shareable/bookmarkable.
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())
    const currentAge = params.get('age')
    const currentPerson = params.get('person')
    const nextAge = selectedAge === null ? null : (selectedAge === 'unknown' ? 'unknown' : String(selectedAge))
    const nextPerson = selectedPerson

    if (currentAge === nextAge && currentPerson === nextPerson) return

    if (nextAge === null) params.delete('age')
    else params.set('age', nextAge)

    if (!nextPerson) params.delete('person')
    else params.set('person', nextPerson)

    const query = params.toString()
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }, [selectedAge, selectedPerson, searchParams, router, pathname])

  const ageSummaryPerson = inferredPersonDetailsName

  const ageSummaryItems: ServerSideAllItem[] = useMemo(() => {
    if (canReuseServerScope) return itemsToShow
    if (!ageSummaryPerson) return itemsToShow
    return itemsToShow.filter((item) => item.persons?.some((person) => person.full === ageSummaryPerson))
  }, [ageSummaryPerson, canReuseServerScope, itemsToShow])

  // Apply age filter without person scoping so the people dropdown can still switch people.
  const ageBaseFiltered: ServerSideAllItem[] = useMemo(() => {
    if (canReuseServerScope) return itemsToShow
    if (selectedAge === null) return itemsToShow
    return itemsToShow.filter(item => {
      if (!item.persons || !item.filename) return false
      const photoDate = resolvePhotoDate(item)
      return item.persons.some(person => {
        const age = person.dob ? calcAgeAtDate(person.dob, photoDate) : 'unknown'
        return age === selectedAge
      })
    })
  }, [canReuseServerScope, itemsToShow, selectedAge])

  // Apply person filter on top of age-only results.
  const ageFiltered: ServerSideAllItem[] = useMemo(() => {
    if (canReuseServerScope) return itemsToShow
    if (!effectiveSelectedPerson) return ageBaseFiltered
    return ageBaseFiltered.filter((item) => {
      return matchesSelectedPersonAge(item, selectedAge, effectiveSelectedPerson)
    })
  }, [ageBaseFiltered, canReuseServerScope, effectiveSelectedPerson, itemsToShow, selectedAge])

  // Unique ages (client recompute only after mount)
  const uniqueAges = useMemo(() => {
    if (canReuseServerSummary && initialAgeSummary) {
      return {
        numeric: initialAgeSummary.ages
          .filter((entry): entry is { age: number; count: number } => entry.age !== 'unknown')
          .map(entry => entry.age),
        hasUnknown: initialAgeSummary.ages.some(entry => entry.age === 'unknown'),
      }
    }
    const set = new Set<number>()
    let hasUnknown = false
    ageSummaryItems.forEach(item => {
      if (!item.persons || !item.filename) return
      const photoDate = resolvePhotoDate(item)
      item.persons.forEach(person => {
        if (ageSummaryPerson && person.full !== ageSummaryPerson) {
          return
        }
        if (!person.dob) {
          hasUnknown = true
          return
        }
        const age = calcAgeAtDate(person.dob, photoDate)
        if (age !== null && !Number.isNaN(age)) set.add(age)
      })
    })
    // Reset if current selection disappeared
    const selectedMissing = selectedAge === 'unknown' ? !hasUnknown : (selectedAge !== null && !set.has(selectedAge))
    if (selectedMissing) {
      setSelectedAge(null)
    }
    return {
      numeric: Array.from(set).sort((a, b) => a - b),
      hasUnknown,
    }
  }, [ageSummaryItems, ageSummaryPerson, canReuseServerSummary, selectedAge, initialAgeSummary])

  const agesWithCounts = useMemo(() => {
    if (canReuseServerSummary && initialAgeSummary) {
      return initialAgeSummary.ages.map(({ age, count }) => ({ age, count }))
    }
    const countMap = new Map<number | 'unknown', number>()
    ageSummaryItems.forEach(item => {
      if (!item.persons || !item.filename) return
      const photoDate = resolvePhotoDate(item)
      const seen = new Set<number | 'unknown'>()
      item.persons.forEach(person => {
        if (ageSummaryPerson && person.full !== ageSummaryPerson) {
          return
        }
        const age = person.dob ? calcAgeAtDate(person.dob, photoDate) : 'unknown'
        if (age !== null && !seen.has(age)) {
          countMap.set(age, (countMap.get(age) || 0) + 1)
          seen.add(age)
        }
      })
    })
    const numeric = uniqueAges.numeric.map(age => ({ age: age as number | 'unknown', count: countMap.get(age) || 0 }))
    const unknown = uniqueAges.hasUnknown ? [{ age: 'unknown' as const, count: countMap.get('unknown') || 0 }] : []
    return [...unknown, ...numeric].filter(a => a.count > 0)
  }, [ageSummaryItems, ageSummaryPerson, canReuseServerSummary, uniqueAges, initialAgeSummary])

  const { peopleAtSelectedAge, peopleWithCounts } = useMemo(() => {
    if (selectedAge === null) return { peopleAtSelectedAge: [], peopleWithCounts: [] }
    const matches: PersonMatch[] = []
    const counts = new Map<string, number>()
    ageBaseFiltered.forEach(item => {
      if (!item.persons || !item.filename) return
      const photoDate = resolvePhotoDate(item)
      item.persons.forEach(person => {
        const age = person.dob ? calcAgeAtDate(person.dob, photoDate) : 'unknown'
        if (age === selectedAge) {
          matches.push({ name: person.full, age, photoDate })
          counts.set(person.full, (counts.get(person.full) || 0) + 1)
        }
      })
    })
    const uniquePeople = Array.from(
      matches.reduce((acc, m) => {
        if (!acc.has(m.name) || acc.get(m.name)!.photoDate > m.photoDate) acc.set(m.name, m)
        return acc
      }, new Map<string, PersonMatch>()),
    ).map(([_, m]) => m.name).sort()
    return {
      peopleAtSelectedAge: uniquePeople,
      peopleWithCounts: uniquePeople
        .map(name => ({ name, count: counts.get(name) || 0 }))
        .sort((a, b) => (b.count - a.count) || a.name.localeCompare(b.name)),
    }
  }, [ageBaseFiltered, selectedAge])

  const totalPhotoCount = useMemo(() => {
    if (canReuseServerSummary && initialAgeSummary) {
      return initialAgeSummary.ages.reduce((sum, { count }) => sum + count, 0)
    }

    return ageSummaryItems.length
  }, [ageSummaryItems, canReuseServerSummary, initialAgeSummary])

  // Build items with corpus for AllItems
  const itemsWithCorpus: ServerSideAllItem[] = useMemo(
    () => ageFiltered.map(i => ({
      ...i,
      coordinateAccuracy: i.coordinateAccuracy ?? 0,
      visitedPlace: i.visitedPlace ?? null,
    })),
    [ageFiltered],
  )

  const { memoryHtml: personsMemoryHtml, setViewed: personsSetViewed } = useMemory(ageFiltered, refImageGallery)
  // Combined memoryHtml: prefer personsMemoryHtml (same structure)
  const finalMemoryHtml = personsMemoryHtml ?? memoryHtml

  // Controls component (ready to render)
  const filterControlsProps: FilterControlsProps = {
    agesWithCounts,
    peopleAtSelectedAge,
    peopleWithCounts,
    selectedAge,
    selectedPerson,
    totalPhotoCount,
    setSelectedAge,
    setSelectedPerson,
  }

  return {
    // from map/search
    refImageGallery,
    memoryIndex,
    setMemoryIndex,
    setViewed: personsSetViewed,
    viewedList,
    keyword,
    searchBox,
    mapFilterEnabled,
    handleToggleMapFilter,
    handleBoundsChange,
    isClearing,
    clearCoordinates,
    // age/person
    selectedAge,
    setSelectedAge,
    selectedPerson,
    setSelectedPerson,
    filterControlsProps,
    // items
    ageFiltered,
    itemsWithCorpus,
    // memory
    memoryHtml: finalMemoryHtml,
  }
}
