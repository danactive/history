import { render, renderHook, act, screen, waitFor, fireEvent } from '@testing-library/react'
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
  indexedKeywords = [],
  onStructuredOptionSubmit,
}: {
  items: any[]
  gallery: Gallery
  personDetailsName?: string | null
  indexedKeywords?: Array<{ label: string; value: string; filterKind?: 'keyword' | 'year' | 'tag' | 'person' }>
  onStructuredOptionSubmit?: (option: { value: string }) => boolean
}) => ({
  refImageGallery: { current: null },
  memoryIndex: 0,
  setMemoryIndex: vi.fn(),
  memoryHtml: null,
  viewedList: new Set<string>(),
  keyword: '',
  searchBox: (
    <>
      {gallery && personDetailsName
        ? <a href={`/${gallery}/persons/details?${new URLSearchParams({ person: personDetailsName }).toString()}`}>Person details</a>
        : null}
      {onStructuredOptionSubmit ? (
        <>
          <button type="button" onClick={() => onStructuredOptionSubmit({ value: 'Alice' })}>Select structured option</button>
          {indexedKeywords.map(option => (
            <button key={option.value} type="button" onClick={() => onStructuredOptionSubmit(option)}>
              Select {option.value}
            </button>
          ))}
        </>
      ) : null}
    </>
  ),
  setDisplayedItems: setDisplayedItemsMock,
  setVisibleCount: setVisibleCountMock,
  mapFilterEnabled: false,
  handleToggleMapFilter: vi.fn(),
  handleBoundsChange: vi.fn(),
  itemsToShow: items,
  isClearing: false,
  clearCoordinates: vi.fn(),
})))

const setDisplayedItemsMock = vi.hoisted(() => vi.fn())
const setVisibleCountMock = vi.hoisted(() => vi.fn())

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
  const createSearchParamsFromQuery = (params: URLSearchParams) => ({
    get: (key: string) => params.get(key),
    toString: () => params.toString(),
  })
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
    setDisplayedItemsMock.mockReset()
    setVisibleCountMock.mockReset()
    vi.mocked(usePathname).mockReturnValue('/demo/persons')
    vi.mocked(useRouter).mockReturnValue({ replace } as any)
    vi.mocked(useSearchParams).mockImplementation(() => searchParamsMock as any)
  })

  test('reads age/person from URL on load', () => {
    query = new URLSearchParams('query=person%3AAlice+%26%26+age%3A21')
    const items = [makeItem('1', 'Alice', '2000-01-01', '2021-02-01')]

    const { result } = renderHook(() => usePersonsFilter({ gallery: 'demo', items, indexedKeywords: [] }))
    expect(result.current.selectedAge).toBe(21)
    expect(result.current.selectedPerson).toBe('Alice')
  })

  test('does not replace a clean persons route on mount', () => {
    const items = [makeItem('1', 'Alice', '2000-01-01', '2021-02-01')]

    renderHook(() => usePersonsFilter({ gallery: 'demo', items, indexedKeywords: [] }))

    expect(replace).not.toHaveBeenCalled()
  })

  test('coalesces duplicate URL replacements before route state catches up', () => {
    const items = [makeItem('1', 'Alice', '2000-01-01', '2021-02-01')]
    const { result } = renderHook(() => usePersonsFilter({ gallery: 'demo', items, indexedKeywords: [] }))

    act(() => {
      result.current.setSelectedAge(21)
      result.current.setSelectedAge(21)
    })

    expect(replace).toHaveBeenCalledTimes(1)
    expect(replace).toHaveBeenCalledWith('/demo/persons?query=age%3A21', { scroll: false })
  })

  test('keeps person when age is cleared', () => {
    query = new URLSearchParams('query=person%3AAlice+%26%26+age%3A21')
    const items = [makeItem('1', 'Alice', '2000-01-01', '2021-02-01')]
    const { result } = renderHook(() => usePersonsFilter({ gallery: 'demo', items, indexedKeywords: [] }))

    act(() => {
      result.current.setSelectedAge(null)
    })

    expect(result.current.selectedAge).toBeNull()
    expect(result.current.selectedPerson).toBe('Alice')
    expect(replace).toHaveBeenCalledWith('/demo/persons?query=person%3AAlice', { scroll: false })
  })

  test('widens immediately to the cached age scope when person is cleared from a server-scoped mixed page', () => {
    query = new URLSearchParams('query=person%3AAlice+%26%26+age%3A21')
    const items = [makeItem('1', 'Alice', '2000-01-01', '2021-02-01')]
    const broaderAgeScope = [
      items[0],
      makeItem('2', 'Bob', '2000-05-01', '2021-06-01'),
    ]

    const { result } = renderHook(() => usePersonsFilter({
      gallery: 'demo',
      items,
      indexedKeywords: [],
      initialSelectedAge: 21,
      initialSelectedPerson: 'Alice',
      initialAgeScopeItems: broaderAgeScope,
      initialAgeSummary: {
        ages: [{ age: 21, count: 2 }],
        totalPhotoCount: 2,
      },
    }))

    act(() => {
      result.current.setSelectedPerson(null)
    })

    expect(result.current.selectedAge).toBe(21)
    expect(result.current.selectedPerson).toBeNull()
    expect(result.current.ageFiltered).toEqual(broaderAgeScope)
    expect(result.current.filterControlsProps.peopleAtSelectedAge).toEqual(['Alice', 'Bob'])
    expect(replace).toHaveBeenCalledWith('/demo/persons?query=age%3A21', { scroll: false })
  })

  test('widens immediately to the cached person scope when age is cleared from a server-scoped mixed page', () => {
    query = new URLSearchParams('query=person%3AAlice+%26%26+age%3A21')
    const items = [makeItem('1', 'Alice', '2000-01-01', '2021-02-01')]
    const broaderPersonScope = [
      items[0],
      makeItem('2', 'Alice', '1973-01-01', '2021-02-01'),
    ]

    const { result } = renderHook(() => usePersonsFilter({
      gallery: 'demo',
      items,
      indexedKeywords: [],
      initialSelectedAge: 21,
      initialSelectedPerson: 'Alice',
      initialPersonScopeItems: broaderPersonScope,
      initialAgeSummary: {
        ages: [
          { age: 21, count: 1 },
          { age: 48, count: 1 },
        ],
        totalPhotoCount: 2,
      },
    }))

    act(() => {
      result.current.setSelectedAge(null)
    })

    expect(result.current.selectedAge).toBeNull()
    expect(result.current.selectedPerson).toBe('Alice')
    expect(result.current.ageFiltered).toEqual(broaderPersonScope)
    expect(result.current.filterControlsProps.totalPhotoCount).toBe(2)
  })

  test('supports unknown age filter from URL', () => {
    query = new URLSearchParams('query=age%3Aunknown')
    const items = [makeUnknownDobItem('1', 'Mystery', '2021-02-01')]

    const { result } = renderHook(() => usePersonsFilter({ gallery: 'demo', items, indexedKeywords: [] }))
    expect(result.current.selectedAge).toBe('unknown')
    expect(result.current.ageFiltered).toHaveLength(1)
  })

  test('does not restore stale age/person params after navigating to a keyword-only url', async () => {
    query = new URLSearchParams('query=Alice')
    const items = [makeItem('1', 'Alice', '2000-01-01', '2021-02-01')]

    const { result } = renderHook(() => usePersonsFilter({
      gallery: 'demo',
      items,
      indexedKeywords: [],
      initialSelectedAge: 21,
      initialSelectedPerson: 'Alice',
    }))

    await waitFor(() => {
      expect(result.current.selectedAge).toBeNull()
      expect(result.current.selectedPerson).toBeNull()
    })

    expect(replace).not.toHaveBeenCalledWith('/demo/persons?query=person%3AAlice+%26%26+age%3A21', { scroll: false })
  })

  test('keeps canonical person and age query state stable', async () => {
    query = new URLSearchParams('query=person%3AAlice+%26%26+age%3A21')
    const items = [makeItem('1', 'Alice', '2000-01-01', '2021-02-01')]

    const { result } = renderHook(() => usePersonsFilter({
      gallery: 'demo',
      items,
      indexedKeywords: [],
      initialSelectedAge: 21,
      initialSelectedPerson: 'Alice',
    }))

    await waitFor(() => {
      expect(result.current.selectedAge).toBe(21)
      expect(result.current.selectedPerson).toBe('Alice')
    })

    expect(replace).not.toHaveBeenCalledWith('/demo/persons?query=person%3AAlice+%26%26+age%3A21', { scroll: false })
  })

  test('keeps unknown age visible when reusing a server-scoped summary', () => {
    query = new URLSearchParams('query=country%3ACanada+%26%26+region%3ABC+%26%26+age%3Aunknown')
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
    expect(screen.getAllByText((_, node) => (
      node?.textContent?.replace(/\s+/g, ' ').trim() === 'Unknown age (1 photo)'
    )).length).toBeGreaterThan(0)
  })

  test('anchors all ages count to the base scope when initial items are age-filtered', () => {
    query = new URLSearchParams('query=age%3Aunknown')
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
        totalPhotoCount: 3,
      },
    }))

    render(<FilterControls {...result.current.filterControlsProps} />)

    expect(screen.getAllByText((_, node) => (
      node?.textContent?.replace(/\s+/g, ' ').trim() === 'All ages (3 photos)'
    )).length).toBeGreaterThan(0)
  })

  test('keeps all ages anchored to the visited scope while unknown remains narrowed', () => {
    query = new URLSearchParams('query=country%3ACanada+%26%26+region%3ABC+%26%26+age%3Aunknown')
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
    expect(screen.getAllByText((_, node) => (
      node?.textContent?.replace(/\s+/g, ' ').trim() === 'All ages (3 photos)'
    )).length).toBeGreaterThan(0)
    expect(screen.getAllByText((_, node) => (
      node?.textContent?.replace(/\s+/g, ' ').trim() === 'Unknown age (1 photo)'
    )).length).toBeGreaterThan(0)
  })

  test('scopes all ages counts to the selected person', () => {
    query = new URLSearchParams('query=person%3AAlice')
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

    expect(screen.getAllByText((_, node) => (
      node?.textContent?.replace(/\s+/g, ' ').trim() === 'All ages (1 photo)'
    )).length).toBeGreaterThan(0)
  })

  test('keeps selected person when selecting an age', () => {
    query = new URLSearchParams('query=person%3AAlice')
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

  test('keeps the people menu anchored to the broader age scope when selecting an age from a person-only page', () => {
    query = new URLSearchParams('query=person%3AAlice')
    const personScopedItems = [
      makeItem('1', 'Alice', '2000-01-01', '2021-02-01'),
      makeItem('2', 'Alice', '1979-01-01', '2021-02-01'),
    ]
    const broaderBaseScope = [
      personScopedItems[0],
      makeItem('3', 'Bob', '2000-05-01', '2021-06-01'),
      personScopedItems[1],
    ]

    const { result } = renderHook(() => usePersonsFilter({
      gallery: 'demo',
      items: personScopedItems,
      indexedKeywords: [],
      initialSelectedPerson: 'Alice',
      initialBaseScopeItems: broaderBaseScope,
      initialAgeSummary: {
        ages: [
          { age: 21, count: 1 },
          { age: 42, count: 1 },
        ],
        totalPhotoCount: 2,
      },
    }))

    act(() => {
      result.current.setSelectedAge(21)
    })

    expect(result.current.selectedAge).toBe(21)
    expect(result.current.selectedPerson).toBe('Alice')
    expect(result.current.ageFiltered).toEqual([personScopedItems[0]])
    expect(result.current.filterControlsProps.peopleAtSelectedAge).toEqual(['Alice', 'Bob'])
    expect(result.current.filterControlsProps.peopleWithCounts).toEqual([
      { name: 'Alice', count: 1 },
      { name: 'Bob', count: 1 },
    ])
    expect(replace).toHaveBeenCalledWith('/demo/persons?query=person%3AAlice+%26%26+age%3A21', { scroll: false })
  })

  test('keeps broader person-scoped age options available while switching ages client-side', () => {
    query = new URLSearchParams('query=person%3AAlice+%26%26+age%3A21')
    const items = [makeItem('1', 'Alice', '2000-01-01', '2021-02-01')]

    const { result } = renderHook(() => usePersonsFilter({
      gallery: 'demo',
      items,
      indexedKeywords: [],
      initialSelectedAge: 21,
      initialSelectedPerson: 'Alice',
      initialAgeSummary: {
        ages: [
          { age: 21, count: 1 },
          { age: 48, count: 3 },
        ],
        totalPhotoCount: 4,
      },
    }))

    act(() => {
      result.current.setSelectedAge(48)
    })

    expect(result.current.selectedAge).toBe(48)
    expect(result.current.filterControlsProps.totalPhotoCount).toBe(4)
    expect(result.current.filterControlsProps.agesWithCounts).toEqual([
      { age: 21, count: 1 },
      { age: 48, count: 3 },
    ])
    expect(replace).toHaveBeenCalledWith('/demo/persons?query=person%3AAlice+%26%26+age%3A48', { scroll: false })
  })

  test('keeps other people available in the people dropdown after selecting a person', () => {
    query = new URLSearchParams('query=person%3AAlice+%26%26+age%3A21')
    const items = [makeItem('1', 'Alice', '2000-01-01', '2021-02-01')]
    const broaderAgeScope = [
      items[0],
      makeItem('2', 'Bob', '2000-05-01', '2021-06-01'),
    ]

    const { result } = renderHook(() => usePersonsFilter({
      gallery: 'demo',
      items,
      indexedKeywords: [],
      initialSelectedAge: 21,
      initialSelectedPerson: 'Alice',
      initialAgeScopeItems: broaderAgeScope,
    }))

    expect(result.current.filterControlsProps.peopleAtSelectedAge).toEqual(['Alice', 'Bob'])
    expect(result.current.filterControlsProps.peopleWithCounts).toEqual([
      { name: 'Alice', count: 1 },
      { name: 'Bob', count: 1 },
    ])
  })

  test('keeps first dropdown counts anchored to the broader age scope after selecting a person client-side', () => {
    query = new URLSearchParams('query=age%3A21')
    const visibleItems = [makeItem('1', 'Alice', '2000-01-01', '2021-02-01')]

    const { result } = renderHook(() => usePersonsFilter({
      gallery: 'demo',
      items: visibleItems,
      indexedKeywords: [],
      initialSelectedAge: 21,
      initialAgeSummary: {
        ages: [
          { age: 21, count: 1 },
          { age: 42, count: 1 },
        ],
        totalPhotoCount: 2,
      },
    }))

    act(() => {
      result.current.setSelectedPerson('Alice')
    })

    expect(result.current.filterControlsProps.totalPhotoCount).toBe(2)
    expect(result.current.filterControlsProps.agesWithCounts).toEqual([
      { age: 21, count: 1 },
      { age: 42, count: 1 },
    ])
    expect(result.current.ageFiltered).toHaveLength(1)
  })

  test('syncs the shared search summary state to the final person-filtered slice', () => {
    query = new URLSearchParams('query=person%3AAlice+%26%26+age%3A21')
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

    expect(result.current.ageFiltered).toEqual([items[0]])
    expect(setDisplayedItemsMock).toHaveBeenLastCalledWith([items[0]])
    expect(setVisibleCountMock).toHaveBeenLastCalledWith(1)
  })

  test('keeps the final person-filtered slice narrow while the people menu stays on the cached age scope', () => {
    query = new URLSearchParams('query=person%3AAlice+%26%26+age%3A21')
    const visibleItems = [makeItem('1', 'Alice', '2000-01-01', '2021-02-01')]
    const broaderAgeScope = [
      visibleItems[0],
      makeItem('2', 'Bob', '2000-05-01', '2021-06-01'),
    ]

    const { result } = renderHook(() => usePersonsFilter({
      gallery: 'demo',
      items: visibleItems,
      indexedKeywords: [],
      initialSelectedAge: 21,
      initialSelectedPerson: 'Alice',
      initialAgeScopeItems: broaderAgeScope,
      initialAgeSummary: {
        ages: [{ age: 21, count: 2 }],
        totalPhotoCount: 2,
      },
    }))

    expect(result.current.ageFiltered).toEqual([visibleItems[0]])
    expect(result.current.filterControlsProps.peopleAtSelectedAge).toEqual(['Alice', 'Bob'])
    expect(result.current.filterControlsProps.peopleWithCounts).toEqual([
      { name: 'Alice', count: 1 },
      { name: 'Bob', count: 1 },
    ])
    expect(setDisplayedItemsMock).toHaveBeenLastCalledWith([visibleItems[0]])
    expect(setVisibleCountMock).toHaveBeenLastCalledWith(1)
  })

  test('keeps the people dropdown visible when a person is already selected', () => {
    query = new URLSearchParams('query=person%3AAlice+%26%26+age%3A21')
    const items = [makeItem('1', 'Alice', '2000-01-01', '2021-02-01')]
    const { result } = renderHook(() => usePersonsFilter({
      gallery: 'demo',
      items,
      indexedKeywords: [],
      initialSelectedAge: 21,
      initialSelectedPerson: 'Alice',
    }))

    render(
      <>
        {result.current.searchBox}
        <FilterControls {...result.current.filterControlsProps} />
      </>,
    )

    expect(screen.getByText('All persons at 21 (1 person)')).toBeInTheDocument()
  })

  test('keeps age/person clear actions out of the standalone persons controls', () => {
    query = new URLSearchParams('query=person%3AAlice+%26%26+age%3A21')
    const items = [makeItem('1', 'Alice', '2000-01-01', '2021-02-01')]
    const { result } = renderHook(() => usePersonsFilter({
      gallery: 'demo',
      items,
      indexedKeywords: [],
      initialSelectedAge: 21,
      initialSelectedPerson: 'Alice',
    }))

    render(<FilterControls {...result.current.filterControlsProps} />)

    expect(screen.queryByText('Person: Alice')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Clear' })).not.toBeInTheDocument()
  })

  test('shows the people dropdown for all ages using the full current scope', () => {
    query = new URLSearchParams('query=country%3AMexico+%26%26+region%3AGuanajuato')
    const items = [
      makeItem('1', 'Alice', '2000-01-01', '2021-02-01'),
      makeItem('2', 'Bob', '1990-01-01', '2021-02-01'),
      makeItem('3', 'Alice', '2000-01-01', '2021-03-01'),
    ]

    const { result } = renderHook(() => usePersonsFilter({ gallery: 'demo', items, indexedKeywords: [] }))

    render(<FilterControls {...result.current.filterControlsProps} />)

    expect(screen.getAllByText('All persons (2 persons)').length).toBeGreaterThan(0)
  })

  test('does not add a second age chip for a canonical age query', () => {
    query = new URLSearchParams('query=country%3AUSA+%26%26+age%3A0')
    const items = [makeItem('1', 'Alice', '2021-01-01', '2021-02-01')]

    renderHook(() => usePersonsFilter({ gallery: 'demo', items, indexedKeywords: [] }))

    const [options] = useMapFilter.mock.lastCall ?? []
    const optionProps = options as Record<string, unknown> | undefined
    expect(optionProps?.extraFilterChips).toBeUndefined()
    expect(optionProps?.extraFiltersActive).toBeUndefined()
  })

  test('shows person details link for a unique partial keyword match', () => {
    query = new URLSearchParams('query=ali')
    const items = [
      makeItem('1', 'Alice', '2000-01-01', '2021-02-01'),
      makeItem('2', 'Bob', '1990-01-01', '2021-02-01'),
    ]

    const { result } = renderHook(() => usePersonsFilter({ gallery: 'demo', items, indexedKeywords: [] }))

    render(<>{result.current.searchBox}</>)

    expect(screen.getByRole('link', { name: 'Person details' })).toHaveAttribute('href', '/demo/persons/details?person=Alice')
  })

  test('maps a pre-existing structured search option to the person filter', async () => {
    query = new URLSearchParams()
    const items = [
      makeItem('1', 'Alice', '2000-01-01', '2021-02-01'),
      makeItem('2', 'Bob', '1990-01-01', '2021-02-01'),
    ]

    const { result } = renderHook(() => usePersonsFilter({
      gallery: 'demo',
      items,
      indexedKeywords: [{ label: 'Alice (1)', value: 'Alice' }],
    }))

    render(<>{result.current.searchBox}</>)

    fireEvent.click(screen.getByRole('button', { name: 'Select structured option' }))

    await waitFor(() => {
      expect(result.current.selectedPerson).toBe('Alice')
    })

    expect(replace).toHaveBeenCalledWith('/demo/persons?query=person%3AAlice', { scroll: false })
  })

  test('does not map a tag search option to the person filter', async () => {
    query = new URLSearchParams()
    const items = [
      makeSearchOnlyItem('1', 'tag^, Alice', '2021-02-01'),
    ]

    const { result } = renderHook(() => usePersonsFilter({
      gallery: 'demo',
      items,
      indexedKeywords: [{ label: 'tag^ (1)', value: 'tag^', filterKind: 'tag' }],
    }))

    render(<>{result.current.searchBox}</>)

    fireEvent.click(screen.getByRole('button', { name: 'Select tag^' }))

    await waitFor(() => {
      expect(result.current.selectedPerson).toBeNull()
    })

    expect(replace).not.toHaveBeenCalledWith('/demo/persons?person=tag%5E', { scroll: false })
  })

  test('scopes all ages to the selected person after choosing a pre-existing structured option', async () => {
    query = new URLSearchParams()
    const items = [
      makeItem('1', 'Alice', '2000-01-01', '2021-02-01'),
      makeItem('2', 'Bob', '1990-01-01', '2021-02-01'),
    ]

    const { result } = renderHook(() => usePersonsFilter({
      gallery: 'demo',
      items,
      indexedKeywords: [{ label: 'Alice (1)', value: 'Alice' }],
    }))

    render(<>{result.current.searchBox}</>)

    fireEvent.click(screen.getByRole('button', { name: 'Select structured option' }))

    await waitFor(() => {
      expect(result.current.selectedPerson).toBe('Alice')
    })

    expect(result.current.filterControlsProps.totalPhotoCount).toBe(1)
    expect(result.current.filterControlsProps.agesWithCounts).toEqual([
      { age: 21, count: 1 },
    ])
  })

  test('keeps the selected person when useSearchParams returns a fresh object before the URL catches up', async () => {
    query = new URLSearchParams()
    vi.mocked(useSearchParams).mockImplementation(() => createSearchParamsFromQuery(query) as any)

    const items = [
      makeItem('1', 'Alice', '2000-01-01', '2021-02-01'),
      makeItem('2', 'Bob', '1990-01-01', '2021-02-01'),
    ]

    const { result } = renderHook(() => usePersonsFilter({
      gallery: 'demo',
      items,
      indexedKeywords: [{ label: 'Alice (1)', value: 'Alice' }],
    }))

    render(<>{result.current.searchBox}</>)

    fireEvent.click(screen.getByRole('button', { name: 'Select structured option' }))

    await waitFor(() => {
      expect(result.current.selectedPerson).toBe('Alice')
    })

    expect(result.current.filterControlsProps.totalPhotoCount).toBe(1)
  })

  test('scopes the first age dropdown to a unique person inferred from the keyword query', () => {
    query = new URLSearchParams('query=ali')
    const items = [
      makeItem('1', 'Alice', '2000-01-01', '2021-02-01'),
      makeItem('2', 'Bob', '1990-01-01', '2021-02-01'),
      makeUnknownDobItem('3', 'Alice', '2021-02-02'),
    ]

    const { result } = renderHook(() => usePersonsFilter({ gallery: 'demo', items, indexedKeywords: [] }))

    render(<FilterControls {...result.current.filterControlsProps} />)

    expect(screen.getAllByText((_, node) => (
      node?.textContent?.replace(/\s+/g, ' ').trim() === 'All ages (2 photos)'
    )).length).toBeGreaterThan(0)
    expect(screen.getAllByText((_, node) => (
      node?.textContent?.replace(/\s+/g, ' ').trim() === 'Unknown age (1 photo)'
    )).length).toBeGreaterThan(0)
    expect(screen.queryByText('All people at unknown (1 person)')).not.toBeInTheDocument()
  })

  test('shows person details link for an exact search-only person token', () => {
    query = new URLSearchParams('query=Taylor+Example')
    const items = [
      makeSearchOnlyItem('1', 'Taylor Example, Jordan Sample', '2021-02-01'),
    ]

    const { result } = renderHook(() => usePersonsFilter({ gallery: 'demo', items, indexedKeywords: [] }))

    render(<>{result.current.searchBox}</>)

    expect(screen.getByRole('link', { name: 'Person details' })).toHaveAttribute('href', '/demo/persons/details?person=Taylor+Example')
  })
})
