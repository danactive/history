'use client'
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useRef,
} from 'react'
import type ReactImageGallery from 'react-image-gallery'
import useMapFilter from './useMapFilter'
import useMemory from './useMemory'
import type { All } from '../types/pages'
import type { ServerSideAllItem, Item } from '../types/common'

type PersonMatch = {
  name: string
  age: number
  photoDate: string
}

function calcAge(dob: string, photoDate: string): number | null {
  try {
    const birth = new Date(dob.substring(0, 10))
    const shot = new Date(photoDate.substring(0, 10))
    if (Number.isNaN(birth.getTime()) || Number.isNaN(shot.getTime())) return null
    let age = shot.getFullYear() - birth.getFullYear()
    const m = shot.getMonth() - birth.getMonth()
    if (m < 0 || (m === 0 && shot.getDate() < birth.getDate())) age -= 1
    return age
  } catch {
    return null
  }
}

export default function usePersonsFilter({ items, indexedKeywords }: All.ComponentProps) {
  const {
    refImageGallery,
    memoryIndex,
    setMemoryIndex,
    setViewed,
    resetViewedList,
    memoryHtml,
    viewedList,
    keyword,
    searchBox,
    mapFilterEnabled,
    handleToggleMapFilter,
    handleBoundsChange,
    itemsToShow,
  } = useMapFilter({ items, indexedKeywords })

  // Age/person selection state
  const [selectedAge, setSelectedAge] = useState<number | null>(null)
  const [selectedPerson, setSelectedPerson] = useState<string | null>(null)

  // Apply age/person filter on top of map + keyword filtered items
  const ageFiltered: Item[] = useMemo(() => {
    if (selectedAge === null && !selectedPerson) return itemsToShow
    return itemsToShow.filter(item => {
      if (!item.persons || !item.filename) return false
      const filenameDate = Array.isArray(item.filename)
        ? (item.filename[0] ?? '').substring(0, 10)
        : String(item.filename).substring(0, 10)
      const photoDate = (item as any).photoDate || filenameDate
      return item.persons.some(person => {
        if (!person.dob) return false
        const age = calcAge(person.dob, photoDate)
        const ageMatch = selectedAge === null ? true : age === selectedAge
        const personMatch = selectedPerson ? person.full === selectedPerson : true
        return ageMatch && personMatch
      })
    })
  }, [itemsToShow, selectedAge, selectedPerson])

  // Unique ages from current visible items
  const uniqueAges = useMemo(() => {
    const set = new Set<number>()
    itemsToShow.forEach(item => {
      if (!item.persons || !item.filename) return
      const filenameDate = Array.isArray(item.filename)
        ? (item.filename[0] ?? '').substring(0, 10)
        : String(item.filename).substring(0, 10)
      const photoDate = (item as any).photoDate || filenameDate
      item.persons.forEach(person => {
        if (!person.dob) return
        const age = calcAge(person.dob, photoDate)
        if (age !== null && !Number.isNaN(age)) set.add(age)
      })
    })
    // Reset if current selection disappeared
    if (selectedAge !== null && !set.has(selectedAge)) {
      setSelectedAge(null)
      setSelectedPerson(null)
    }
    return Array.from(set).sort((a, b) => a - b)
  }, [itemsToShow, selectedAge])

  const agesWithCounts = useMemo(() => {
    const countMap = new Map<number, number>()
    itemsToShow.forEach(item => {
      if (!item.persons || !item.filename) return
      const filenameDate = Array.isArray(item.filename)
        ? (item.filename[0] ?? '').substring(0, 10)
        : String(item.filename).substring(0, 10)
      const photoDate = (item as any).photoDate || filenameDate
      const seen = new Set<number>()
      item.persons.forEach(person => {
        if (!person.dob) return
        const age = calcAge(person.dob, photoDate)
        if (age !== null && !seen.has(age)) {
          countMap.set(age, (countMap.get(age) || 0) + 1)
          seen.add(age)
        }
      })
    })
    return uniqueAges.map(age => ({ age, count: countMap.get(age) || 0 })).filter(a => a.count > 0)
  }, [itemsToShow, uniqueAges])

  const { peopleAtSelectedAge, peopleWithCounts } = useMemo(() => {
    if (selectedAge === null) return { peopleAtSelectedAge: [], peopleWithCounts: [] }
    const matches: PersonMatch[] = []
    const counts = new Map<string, number>()
    ageFiltered.forEach(item => {
      if (!item.persons || !item.filename) return
      const filenameDate = Array.isArray(item.filename)
        ? (item.filename[0] ?? '').substring(0, 10)
        : String(item.filename).substring(0, 10)
      const photoDate = (item as any).photoDate || filenameDate
      item.persons.forEach(person => {
        if (!person.dob) return
        const age = calcAge(person.dob, photoDate)
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

  // Memory (depends on ageFiltered list for gallery)
  const { memoryHtml: personsMemoryHtml, setViewed: personsSetViewed } = useMemory(ageFiltered, refImageGallery)

  const resetToken = mapFilterEnabled ? 1 : 0

  // Combined memoryHtml: prefer personsMemoryHtml (same structure)
  const finalMemoryHtml = personsMemoryHtml ?? memoryHtml

  // Controls component (ready to render)
  const controls = (
    <div className="mt-4">
      <select
        value={selectedAge ?? ''}
        onChange={e => {
          const v = e.target.value
          setSelectedAge(v ? parseInt(v, 10) : null)
          setSelectedPerson(null)
        }}
      >
        <option value="">
          All ages ({totalPhotoCount} {totalPhotoCount === 1 ? 'photo' : 'photos'})
        </option>
        {agesWithCounts.map(({ age, count }) => (
          <option key={age} value={age}>
            {age} ({count} {count === 1 ? 'photo' : 'photos'})
          </option>
        ))}
      </select>
      {selectedAge !== null && peopleAtSelectedAge.length > 0 && (
        <select
          className="ml-2"
          value={selectedPerson ?? ''}
          onChange={e => setSelectedPerson(e.target.value || null)}
        >
          <option value="">
            All people at {selectedAge} ({peopleAtSelectedAge.length} {peopleAtSelectedAge.length === 1 ? 'person' : 'people'})
          </option>
          {peopleWithCounts.map(({ name, count }) => (
            <option key={name} value={name}>
              {name} ({count} {count === 1 ? 'photo' : 'photos'})
            </option>
          ))}
        </select>
      )}
    </div>
  )

  return {
    // from map/search
    refImageGallery,
    memoryIndex,
    setMemoryIndex,
    setViewed: personsSetViewed,
    resetViewedList,
    viewedList,
    keyword,
    searchBox,
    mapFilterEnabled,
    handleToggleMapFilter,
    handleBoundsChange,
    // age/person
    selectedAge,
    setSelectedAge,
    selectedPerson,
    setSelectedPerson,
    controls,
    // items
    ageFiltered,
    itemsWithCorpus,
    // memory
    memoryHtml: finalMemoryHtml,
    resetToken,
  }
}
