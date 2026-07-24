'use client'
import Button from '@mui/joy/Button'
import Chip from '@mui/joy/Chip'
import Option from '@mui/joy/Option'
import Select from '@mui/joy/Select'
import Stack from '@mui/joy/Stack'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
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
  const [mounted, setMounted] = useState(false)
  const isServerScopeCurrent = selectedAge === resolvedInitialAge && selectedPerson === resolvedInitialPerson
  const hasVisitedFilter = Boolean(searchParams.get('visitedCountry'))

  const keywordFromUrl = searchParams.get('keyword') ?? ''
  const personDetailsName = useMemo(() => {
    if (selectedPerson) return selectedPerson

    return resolveUniquePersonName(items, keywordFromUrl)
  }, [items, keywordFromUrl, selectedPerson])
  const effectiveSelectedPerson = selectedPerson ?? personDetailsName

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
    personDetailsName,
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

  useEffect(() => { setMounted(true) }, [])

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

  const personScopedItems: ServerSideAllItem[] = useMemo(() => {
    if (canReuseServerScope) return itemsToShow
    if (!effectiveSelectedPerson) return itemsToShow
    return itemsToShow.filter((item) => item.persons?.some((person) => person.full === effectiveSelectedPerson))
  }, [canReuseServerScope, effectiveSelectedPerson, itemsToShow])

  // Apply age filter (without person) first so person options stay stable.
  const ageOnlyFiltered: ServerSideAllItem[] = useMemo(() => {
    if (canReuseServerScope) return itemsToShow
    if (selectedAge === null) return personScopedItems
    return personScopedItems.filter(item => {
      if (!item.persons || !item.filename) return false
      const photoDate = resolvePhotoDate(item)
      return item.persons.some(person => {
        const age = person.dob ? calcAgeAtDate(person.dob, photoDate) : 'unknown'
        return age === selectedAge
      })
    })
  }, [canReuseServerScope, itemsToShow, personScopedItems, selectedAge])

  // Apply person filter on top of age-only results.
  const ageFiltered: ServerSideAllItem[] = useMemo(() => {
    if (canReuseServerScope) return itemsToShow
    if (!effectiveSelectedPerson) return ageOnlyFiltered
    return ageOnlyFiltered.filter((item) => {
      return matchesSelectedPersonAge(item, selectedAge, effectiveSelectedPerson)
    })
  }, [ageOnlyFiltered, canReuseServerScope, effectiveSelectedPerson, itemsToShow, selectedAge])

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
    personScopedItems.forEach(item => {
      if (!item.persons || !item.filename) return
      const photoDate = resolvePhotoDate(item)
      item.persons.forEach(person => {
        if (effectiveSelectedPerson && person.full !== effectiveSelectedPerson) {
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
  }, [canReuseServerSummary, effectiveSelectedPerson, personScopedItems, selectedAge, initialAgeSummary])

  const agesWithCounts = useMemo(() => {
    if (canReuseServerSummary && initialAgeSummary) {
      return initialAgeSummary.ages.map(({ age, count }) => ({ age, count }))
    }
    const countMap = new Map<number | 'unknown', number>()
    personScopedItems.forEach(item => {
      if (!item.persons || !item.filename) return
      const photoDate = resolvePhotoDate(item)
      const seen = new Set<number | 'unknown'>()
      item.persons.forEach(person => {
        if (effectiveSelectedPerson && person.full !== effectiveSelectedPerson) {
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
  }, [canReuseServerSummary, effectiveSelectedPerson, personScopedItems, uniqueAges, initialAgeSummary])

  const { peopleAtSelectedAge, peopleWithCounts } = useMemo(() => {
    if (selectedAge === null) return { peopleAtSelectedAge: [], peopleWithCounts: [] }
    const matches: PersonMatch[] = []
    const counts = new Map<string, number>()
    ageOnlyFiltered.forEach(item => {
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
  }, [ageOnlyFiltered, selectedAge])

  const totalPhotoCount = useMemo(() => {
    if (canReuseServerSummary && initialAgeSummary) {
      return initialAgeSummary.ages.reduce((sum, { count }) => sum + count, 0)
    }

    return personScopedItems.length
  }, [canReuseServerSummary, initialAgeSummary, personScopedItems])

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
  const baseControls = (
    <Stack direction="row" spacing={1} sx={{ mt: 2, alignItems: 'center', flexWrap: 'wrap' }}>
      <Select
        value={selectedAge === null ? '' : String(selectedAge)}
        onChange={(_, value) => {
          const nextAge = value === 'unknown'
            ? 'unknown'
            : (value ? Number.parseInt(value, 10) : null)
          setSelectedAge(nextAge === 'unknown' || !Number.isNaN(nextAge as number) ? nextAge : null)
        }}
        variant="soft"
        size="sm"
      >
        <Option value="">
          All ages ({totalPhotoCount} {totalPhotoCount === 1 ? 'photo' : 'photos'})
        </Option>
        {agesWithCounts.map(({ age, count }) => (
          <Option key={String(age)} value={String(age)}>
            {age === 'unknown' ? 'Unknown age' : age} ({count} {count === 1 ? 'photo' : 'photos'})
          </Option>
        ))}
      </Select>

      {selectedAge !== null && !effectiveSelectedPerson && peopleAtSelectedAge.length > 0 && (
        <Select
          value={selectedPerson ?? ''}
          onChange={(_, value) => setSelectedPerson(value || null)}
          variant="soft"
          size="sm"
        >
          <Option value="">
            All people at {selectedAge} ({peopleAtSelectedAge.length} {peopleAtSelectedAge.length === 1 ? 'person' : 'people'})
          </Option>
          {peopleWithCounts.map(({ name, count }) => (
            <Option key={name} value={name}>
              {name} ({count} {count === 1 ? 'photo' : 'photos'})
            </Option>
          ))}
        </Select>
      )}

      {selectedAge !== null && (
        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
          <Chip
            size="sm"
            color="primary"
            variant="soft"
          >
            Age: {selectedAge === 'unknown' ? 'Unknown' : selectedAge}
          </Chip>
          <Button
            size="sm"
            variant="plain"
            onClick={() => {
              setSelectedAge(null)
            }}
          >
            ×
          </Button>
        </Stack>
      )}

      {selectedPerson && (
        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
          <Chip
            size="sm"
            color="primary"
            variant="soft"
          >
            Person: {selectedPerson}
          </Chip>
          <Button
            size="sm"
            variant="plain"
            onClick={() => setSelectedPerson(null)}
          >
            ×
          </Button>
        </Stack>
      )}

      <Button
        size="sm"
        variant="outlined"
        onClick={() => {
          setSelectedAge(null)
          setSelectedPerson(null)
        }}
        disabled={selectedAge === null && selectedPerson === null}
      >
        Clear
      </Button>
    </Stack>
  )

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
    controls: baseControls,
    overrideAgeSummary: !mounted && canReuseServerSummary && initialAgeSummary ? baseControls : null,
    // items
    ageFiltered,
    itemsWithCorpus,
    // memory
    memoryHtml: finalMemoryHtml,
  }
}
