'use client'
import Button from '@mui/joy/Button'
import Chip from '@mui/joy/Chip'
import Option from '@mui/joy/Option'
import Select from '@mui/joy/Select'
import Stack from '@mui/joy/Stack'
import { useEffect, useMemo, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import type { Item, ServerSideAllItem } from '../types/common'
import type { All } from '../types/pages'
import { calcAgeAtDate, resolvePhotoDate } from '../utils/person-age'
import useMapFilter from './useMapFilter'
import useMemory from './useMemory'

type PersonMatch = {
  name: string
  age: number
  photoDate: string
}

export default function usePersonsFilter({
  items,
  indexedKeywords,
  initialAgeSummary,
}: All.ItemData & { initialAgeSummary?: { ages: { age: number; count: number }[] } }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

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
  } = useMapFilter({ items, indexedKeywords })

  // Age/person selection state
  const [selectedAge, setSelectedAge] = useState<number | null>(null)
  const [selectedPerson, setSelectedPerson] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  // Keep local state in sync when URL changes externally (navigation/back/forward/share links).
  useEffect(() => {
    const ageParam = searchParams.get('age')
    const parsedAge = ageParam ? Number.parseInt(ageParam, 10) : null
    const ageFromUrl = Number.isNaN(parsedAge) ? null : parsedAge
    const personFromUrl = searchParams.get('person')

    setSelectedAge(prev => (prev === ageFromUrl ? prev : ageFromUrl))
    setSelectedPerson(prev => (prev === personFromUrl ? prev : personFromUrl))
  }, [searchParams])

  // Persist selected age/person to URL so filtered views are shareable/bookmarkable.
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())
    const currentAge = params.get('age')
    const currentPerson = params.get('person')
    const nextAge = selectedAge === null ? null : String(selectedAge)
    const nextPerson = selectedPerson

    if (currentAge === nextAge && currentPerson === nextPerson) return

    if (nextAge === null) params.delete('age')
    else params.set('age', nextAge)

    if (!nextPerson) params.delete('person')
    else params.set('person', nextPerson)

    const query = params.toString()
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }, [selectedAge, selectedPerson, searchParams, router, pathname])

  // Apply age/person filter on top of map + keyword filtered items
  const ageFiltered: Item[] = useMemo(() => {
    if (selectedAge === null && !selectedPerson) return itemsToShow
    return itemsToShow.filter(item => {
      if (!item.persons || !item.filename) return false
      const photoDate = resolvePhotoDate(item)
      return item.persons.some(person => {
        if (!person.dob) return false
        const age = calcAgeAtDate(person.dob, photoDate)
        const ageMatch = selectedAge === null ? true : age === selectedAge
        const personMatch = selectedPerson ? person.full === selectedPerson : true
        return ageMatch && personMatch
      })
    })
  }, [itemsToShow, selectedAge, selectedPerson])

  // Unique ages (client recompute only after mount)
  const uniqueAges = useMemo(() => {
    if (!mounted && initialAgeSummary) {
      return initialAgeSummary.ages.map(a => a.age)
    }
    const set = new Set<number>()
    itemsToShow.forEach(item => {
      if (!item.persons || !item.filename) return
      const photoDate = resolvePhotoDate(item)
      item.persons.forEach(person => {
        if (!person.dob) return
        const age = calcAgeAtDate(person.dob, photoDate)
        if (age !== null && !Number.isNaN(age)) set.add(age)
      })
    })
    // Reset if current selection disappeared
    if (selectedAge !== null && !set.has(selectedAge)) {
      setSelectedAge(null)
      setSelectedPerson(null)
    }
    return Array.from(set).sort((a, b) => a - b)
  }, [itemsToShow, selectedAge, mounted, initialAgeSummary])

  const agesWithCounts = useMemo(() => {
    if (!mounted && initialAgeSummary) {
      return initialAgeSummary.ages
    }
    const countMap = new Map<number, number>()
    itemsToShow.forEach(item => {
      if (!item.persons || !item.filename) return
      const photoDate = resolvePhotoDate(item)
      const seen = new Set<number>()
      item.persons.forEach(person => {
        if (!person.dob) return
        const age = calcAgeAtDate(person.dob, photoDate)
        if (age !== null && !seen.has(age)) {
          countMap.set(age, (countMap.get(age) || 0) + 1)
          seen.add(age)
        }
      })
    })
    return uniqueAges.map(age => ({ age, count: countMap.get(age) || 0 })).filter(a => a.count > 0)
  }, [itemsToShow, uniqueAges, mounted, initialAgeSummary])

  const { peopleAtSelectedAge, peopleWithCounts } = useMemo(() => {
    if (selectedAge === null) return { peopleAtSelectedAge: [], peopleWithCounts: [] }
    const matches: PersonMatch[] = []
    const counts = new Map<string, number>()
    ageFiltered.forEach(item => {
      if (!item.persons || !item.filename) return
      const photoDate = resolvePhotoDate(item)
      item.persons.forEach(person => {
        if (!person.dob) return
        const age = calcAgeAtDate(person.dob, photoDate)
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
      peopleWithCounts: uniquePeople.map(name => ({ name, count: counts.get(name) || 0 })),
    }
  }, [ageFiltered, selectedAge])

  const totalPhotoCount = useMemo(
    () => itemsToShow.filter(item => item.persons?.some(p => p.dob)).length,
    [itemsToShow],
  )

  // Build items with corpus for AllItems
  const itemsWithCorpus: ServerSideAllItem[] = useMemo(
    () => ageFiltered.map(i => ({
      corpus: (i as any).corpus ?? '',
      ...i,
      coordinateAccuracy: i.coordinateAccuracy ?? 0,
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
          const nextAge = value ? Number.parseInt(value, 10) : null
          setSelectedAge(Number.isNaN(nextAge as number) ? null : nextAge)
          setSelectedPerson(null)
        }}
        variant="soft"
        size="sm"
      >
        <Option value="">
          All ages ({totalPhotoCount} {totalPhotoCount === 1 ? 'photo' : 'photos'})
        </Option>
        {agesWithCounts.map(({ age, count }) => (
          <Option key={age} value={String(age)}>
            {age} ({count} {count === 1 ? 'photo' : 'photos'})
          </Option>
        ))}
      </Select>

      {selectedAge !== null && peopleAtSelectedAge.length > 0 && (
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
            Age: {selectedAge}
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
    overrideAgeSummary: !mounted && initialAgeSummary ? baseControls : null,
    // items
    ageFiltered,
    itemsWithCorpus,
    // memory
    memoryHtml: finalMemoryHtml,
  }
}
