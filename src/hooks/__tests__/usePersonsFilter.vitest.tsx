import { render, renderHook, act, screen } from '@testing-library/react'
import { beforeEach, describe, expect, test, vi } from 'vitest'

vi.mock('next/navigation', () => ({
  useSearchParams: vi.fn(),
  useRouter: vi.fn(),
  usePathname: vi.fn(),
}))

const useMapFilter = vi.hoisted(() => vi.fn(({
  items,
  gallery,
  personDetailsName,
}: {
  items: any[]
  gallery: Gallery
  personDetailsName?: string | null
}) => ({
  refImageGallery: { current: null },
  memoryIndex: 0,
  setMemoryIndex: vi.fn(),
  memoryHtml: null,
  viewedList: new Set<string>(),
  keyword: '',
  searchBox: gallery && personDetailsName
    ? <a href={`/${gallery}/persons/details?${new URLSearchParams({ person: personDetailsName }).toString()}`}>Person details</a>
    : null,
  mapFilterEnabled: false,
  handleToggleMapFilter: vi.fn(),
  handleBoundsChange: vi.fn(),
  itemsToShow: items,
  isClearing: false,
  clearCoordinates: vi.fn(),
})))

vi.mock('../useMapFilter', () => ({
  __esModule: true,
  default: useMapFilter,
}))

vi.mock('../useMemory', () => ({
  __esModule: true,
  default: () => ({
    memoryHtml: null,
    setViewed: vi.fn(),
  }),
}))

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import FilterControls from '../../components/Persons/FilterControls'
import type { Gallery, ServerSideAllItem } from '../../types/common'
import usePersonsFilter from '../usePersonsFilter'

function makeItem(id: string, personName: string, dob: string, photoDate: string): ServerSideAllItem {
  return {
    gallery: 'demo',
    corpus: 'test-corpus',
    id,
    filename: `${photoDate}-50.jpg`,
    photoDate,
    city: '',
    location: null,
    caption: '',
    description: null,
    search: null,
    persons: [{ full: personName, dob }],
    title: '',
    coordinates: null,
    coordinateAccuracy: 0,
    thumbPath: '',
    photoPath: '',
    mediaPath: '',
    videoPaths: null,
    reference: null,
    visitedPlace: null,
  }
}

function makeUnknownDobItem(id: string, personName: string, photoDate: string): ServerSideAllItem {
  return {
    gallery: 'demo',
    corpus: 'test-corpus',
    id,
    filename: `${photoDate}-50.jpg`,
    photoDate,
    city: '',
    location: null,
    caption: '',
    description: null,
    search: null,
    persons: [{ full: personName, dob: null }],
    title: '',
    coordinates: null,
    coordinateAccuracy: 0,
    thumbPath: '',
    photoPath: '',
    mediaPath: '',
    videoPaths: null,
    reference: null,
    visitedPlace: null,
  }
}

function makeSearchOnlyItem(id: string, search: string, photoDate: string): ServerSideAllItem {
  return {
    gallery: 'demo',
    corpus: 'test-corpus',
    id,
    filename: `${photoDate}-50.jpg`,
    photoDate,
    city: '',
    location: null,
    caption: '',
    description: null,
    search,
    persons: null,
    title: '',
    coordinates: null,
    coordinateAccuracy: 0,
    thumbPath: '',
    photoPath: '',
    mediaPath: '',
    videoPaths: null,
    reference: null,
    visitedPlace: null,
  }
}

describe('usePersonsFilter URL sync', () => {
  let query = new URLSearchParams()
  const searchParamsMock = {
    get: (key: string) => query.get(key),
    toString: () => query.toString(),
  }
  const replace = vi.fn((url: string) => {
    const q = url.split('?')[1] ?? ''
    query = new URLSearchParams(q)
  })

  beforeEach(() => {
    query = new URLSearchParams()
    replace.mockClear()
    useMapFilter.mockClear()
    vi.mocked(usePathname).mockReturnValue('/demo/persons')
    vi.mocked(useRouter).mockReturnValue({ replace } as any)
    vi.mocked(useSearchParams).mockImplementation(() => searchParamsMock as any)
  })

  test('reads age/person from URL on load', () => {
    query = new URLSearchParams('age=21&person=Alice')
    const items = [makeItem('1', 'Alice', '2000-01-01', '2021-02-01')]

    const { result } = renderHook(() => usePersonsFilter({ gallery: 'demo', items, indexedKeywords: [] }))
    expect(result.current.selectedAge).toBe(21)
    expect(result.current.selectedPerson).toBe('Alice')
  })

  test('keeps person when age is cleared', () => {
    query = new URLSearchParams('age=21&person=Alice')
    const items = [makeItem('1', 'Alice', '2000-01-01', '2021-02-01')]
    const { result } = renderHook(() => usePersonsFilter({ gallery: 'demo', items, indexedKeywords: [] }))

    act(() => {
      result.current.setSelectedAge(null)
    })

    expect(result.current.selectedAge).toBeNull()
    expect(result.current.selectedPerson).toBe('Alice')
    expect(replace).toHaveBeenCalledWith('/demo/persons?person=Alice', { scroll: false })
  })

  test('supports unknown age filter from URL', () => {
    query = new URLSearchParams('age=unknown')
    const items = [makeUnknownDobItem('1', 'Mystery', '2021-02-01')]

    const { result } = renderHook(() => usePersonsFilter({ gallery: 'demo', items, indexedKeywords: [] }))
    expect(result.current.selectedAge).toBe('unknown')
    expect(result.current.ageFiltered).toHaveLength(1)
  })

  test('keeps unknown age visible when reusing a server-scoped summary', () => {
    query = new URLSearchParams('visitedCountry=Canada&visitedRegion=BC&age=unknown')
    const items = [makeUnknownDobItem('1', 'Mystery', '2021-02-01')]

    const { result } = renderHook(() => usePersonsFilter({
      gallery: 'demo',
      items,
      indexedKeywords: [],
      initialSelectedAge: 'unknown',
      initialAgeSummary: { ages: [{ age: 'unknown', count: 1 }] },
    }))

    render(<FilterControls {...result.current.filterControlsProps} />)

    expect(result.current.selectedAge).toBe('unknown')
    expect(result.current.ageFiltered).toHaveLength(1)
    expect(screen.getByText((_, node) => (
      node?.textContent?.replace(/\s+/g, ' ').trim() === 'Unknown age (1 photo)'
    ))).toBeInTheDocument()
  })

  test('anchors all ages count to the base scope when initial items are age-filtered', () => {
    query = new URLSearchParams('age=unknown')
    const items = [makeUnknownDobItem('1', 'Mystery', '2021-02-01')]

    const { result } = renderHook(() => usePersonsFilter({
      gallery: 'demo',
      items,
      indexedKeywords: [],
      initialSelectedAge: 'unknown',
      initialAgeSummary: {
        ages: [
          { age: 'unknown', count: 1 },
          { age: 21, count: 2 },
        ],
      },
    }))

    render(<FilterControls {...result.current.filterControlsProps} />)

    expect(screen.getByText((_, node) => (
      node?.textContent?.replace(/\s+/g, ' ').trim() === 'All ages (3 photos)'
    ))).toBeInTheDocument()
  })

  test('keeps all ages anchored to the visited scope while unknown remains narrowed', () => {
    query = new URLSearchParams('visitedCountry=Canada&visitedRegion=BC&age=unknown')
    const items = [
      makeItem('1', 'Alice', '2000-01-01', '2021-02-01'),
      makeUnknownDobItem('2', 'Mystery', '2021-02-01'),
      makeItem('3', 'Bob', '1990-01-01', '2021-02-01'),
    ]

    const { result } = renderHook(() => usePersonsFilter({
      gallery: 'demo',
      items,
      indexedKeywords: [],
      initialSelectedAge: 'unknown',
    }))

    render(<FilterControls {...result.current.filterControlsProps} />)

    expect(result.current.ageFiltered).toHaveLength(1)
    expect(screen.getByText((_, node) => (
      node?.textContent?.replace(/\s+/g, ' ').trim() === 'All ages (3 photos)'
    ))).toBeInTheDocument()
    expect(screen.getByText((_, node) => (
      node?.textContent?.replace(/\s+/g, ' ').trim() === 'Unknown age (1 photo)'
    ))).toBeInTheDocument()
  })

  test('scopes all ages counts to the selected person', () => {
    query = new URLSearchParams('person=Alice')
    const items = [
      makeItem('1', 'Alice', '2000-01-01', '2021-02-01'),
    ]

    const { result } = renderHook(() => usePersonsFilter({
      gallery: 'demo',
      items,
      indexedKeywords: [],
      initialSelectedPerson: 'Alice',
    }))

    render(<FilterControls {...result.current.filterControlsProps} />)

    expect(screen.getByText((_, node) => (
      node?.textContent?.replace(/\s+/g, ' ').trim() === 'All ages (1 photo)'
    ))).toBeInTheDocument()
  })

  test('keeps selected person when selecting an age', () => {
    query = new URLSearchParams('person=Alice')
    const items = [makeItem('1', 'Alice', '2000-01-01', '2021-02-01')]
    const { result } = renderHook(() => usePersonsFilter({
      gallery: 'demo',
      items,
      indexedKeywords: [],
      initialSelectedPerson: 'Alice',
    }))

    act(() => {
      result.current.setSelectedAge(21)
    })

    expect(result.current.selectedPerson).toBe('Alice')
  })

  test('keeps other people available in the people dropdown after selecting a person', () => {
    query = new URLSearchParams('person=Alice&age=21')
    const items = [
      makeItem('1', 'Alice', '2000-01-01', '2021-02-01'),
      makeItem('2', 'Bob', '2000-05-01', '2021-06-01'),
    ]

    const { result } = renderHook(() => usePersonsFilter({
      gallery: 'demo',
      items,
      indexedKeywords: [],
      initialSelectedAge: 21,
      initialSelectedPerson: 'Alice',
    }))

    expect(result.current.filterControlsProps.peopleAtSelectedAge).toEqual(['Alice', 'Bob'])
    expect(result.current.filterControlsProps.peopleWithCounts).toEqual([
      { name: 'Alice', count: 1 },
      { name: 'Bob', count: 1 },
    ])
  })

  test('keeps first dropdown counts anchored to the age scope after selecting a person client-side', () => {
    query = new URLSearchParams('age=21')
    const items = [
      makeItem('1', 'Alice', '2000-01-01', '2021-02-01'),
      makeItem('2', 'Bob', '2000-05-01', '2021-06-01'),
    ]

    const { result } = renderHook(() => usePersonsFilter({
      gallery: 'demo',
      items,
      indexedKeywords: [],
      initialSelectedAge: 21,
    }))

    act(() => {
      result.current.setSelectedPerson('Alice')
    })

    expect(result.current.filterControlsProps.totalPhotoCount).toBe(2)
    expect(result.current.filterControlsProps.agesWithCounts).toEqual([
      { age: 21, count: 2 },
    ])
    expect(result.current.ageFiltered).toHaveLength(1)
  })

  test('keeps the people dropdown visible when a person is already selected', () => {
    query = new URLSearchParams('person=Alice&age=21')
    const items = [makeItem('1', 'Alice', '2000-01-01', '2021-02-01')]
    const { result } = renderHook(() => usePersonsFilter({
      gallery: 'demo',
      items,
      indexedKeywords: [],
      initialSelectedAge: 21,
      initialSelectedPerson: 'Alice',
    }))

    render(<FilterControls {...result.current.filterControlsProps} />)

    expect(screen.getByText('All people at 21 (1 person)')).toBeInTheDocument()
    expect(screen.getByText('Person: Alice')).toBeInTheDocument()
  })

  test('shows person details link for a unique partial keyword match', () => {
    query = new URLSearchParams('keyword=ali')
    const items = [
      makeItem('1', 'Alice', '2000-01-01', '2021-02-01'),
      makeItem('2', 'Bob', '1990-01-01', '2021-02-01'),
    ]

    const { result } = renderHook(() => usePersonsFilter({ gallery: 'demo', items, indexedKeywords: [] }))

    render(<>{result.current.searchBox}</>)

    expect(screen.getByRole('link', { name: 'Person details' })).toHaveAttribute('href', '/demo/persons/details?person=Alice')
  })

  test('scopes the first age dropdown to a unique person inferred from the keyword query', () => {
    query = new URLSearchParams('keyword=ali')
    const items = [
      makeItem('1', 'Alice', '2000-01-01', '2021-02-01'),
      makeItem('2', 'Bob', '1990-01-01', '2021-02-01'),
      makeUnknownDobItem('3', 'Alice', '2021-02-02'),
    ]

    const { result } = renderHook(() => usePersonsFilter({ gallery: 'demo', items, indexedKeywords: [] }))

    render(<FilterControls {...result.current.filterControlsProps} />)

    expect(screen.getByText((_, node) => (
      node?.textContent?.replace(/\s+/g, ' ').trim() === 'All ages (2 photos)'
    ))).toBeInTheDocument()
    expect(screen.getByText((_, node) => (
      node?.textContent?.replace(/\s+/g, ' ').trim() === 'Unknown age (1 photo)'
    ))).toBeInTheDocument()
    expect(screen.queryByText('All people at unknown (1 person)')).not.toBeInTheDocument()
  })

  test('shows person details link for an exact search-only person token', () => {
    query = new URLSearchParams('keyword=Taylor+Example')
    const items = [
      makeSearchOnlyItem('1', 'Taylor Example, Jordan Sample', '2021-02-01'),
    ]

    const { result } = renderHook(() => usePersonsFilter({ gallery: 'demo', items, indexedKeywords: [] }))

    render(<>{result.current.searchBox}</>)

    expect(screen.getByRole('link', { name: 'Person details' })).toHaveAttribute('href', '/demo/persons/details?person=Taylor+Example')
  })
})

