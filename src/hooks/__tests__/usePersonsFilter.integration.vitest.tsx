import { act, fireEvent, render, renderHook, screen } from '@testing-library/react'
import { beforeEach, expect, test, vi } from 'vitest'
import usePersonsFilter from '../usePersonsFilter'
import { parsePersonsRouteFilters } from '../../lib/persons-route-filters'
import { derivePersonsScopes } from '../../lib/persons-filter-scopes'
import type { Persons } from '../../types/pages'
import type { ServerSideAllItem } from '../../types/common'

const navigation = vi.hoisted(() => ({
  params: new URLSearchParams(),
  router: { replace: vi.fn(), push: vi.fn() },
}))
vi.mock('next/navigation', () => ({
  usePathname: () => '/demo/persons',
  useSearchParams: () => navigation.params,
  useRouter: () => navigation.router,
}))
const memory = vi.hoisted(() => ({ setViewed: vi.fn(), memoryHtml: null, viewedList: new Set<string>() }))
vi.mock('../useMemory', () => ({ default: () => memory }))

const items: ServerSideAllItem[] = ['Casey Example', 'Alice Example', 'Bob Example'].map((name, index) => ({
  id: String(index), gallery: 'demo', corpus: name, filename: `2021-02-0${index + 1}-01.jpg`,
  photoDate: `2021-02-0${index + 1}`, city: '', location: null, caption: '', description: null,
  search: name, persons: [{ full: name, dob: '2000-01-01' }], title: '',
  coordinates: [10 + index * 10, 10 + index * 10], coordinateAccuracy: 0,
  thumbPath: '', photoPath: '', mediaPath: '', videoPaths: null, reference: null, visitedPlace: null,
}))

function pageData(): Persons.ItemData {
  const filters = parsePersonsRouteFilters({ query: navigation.params.get('query') ?? '' })
  return {
    gallery: 'demo', indexedKeywords: [], totalItemCount: items.length,
    items: derivePersonsScopes({ items, selectedAge: filters.selectedAge, effectiveSelectedPerson: filters.selectedPerson }).ageFiltered,
    initialBaseScopeItems: filters.selectedAge !== null || filters.selectedPerson ? items : undefined,
    initialSelectedAge: filters.selectedAge, initialSelectedPerson: filters.selectedPerson,
  }
}

beforeEach(() => {
  navigation.params = new URLSearchParams()
  navigation.router.replace.mockReset()
  navigation.router.push.mockReset()
})

test('real shared search and map hooks restore counts through repeated Clear and person-chip removal', () => {
  const { result, rerender } = renderHook((props: Persons.ItemData) => usePersonsFilter(props), { initialProps: pageData() })
  const controls = render(result.current.searchBox)
  const arrive = () => {
    const url = navigation.router.replace.mock.lastCall![0] as string
    navigation.params = new URLSearchParams(url.split('?')[1] ?? '')
    rerender(pageData())
    controls.rerender(result.current.searchBox)
  }

  for (const clearLabel of ['Clear', 'Clear person filter Casey Example', 'Clear']) {
    act(() => result.current.setSelectedPerson('Casey Example'))
    arrive()
    expect(result.current.ageFiltered).toHaveLength(1)
    fireEvent.click(screen.getByRole('button', { name: clearLabel }))
    arrive()
    expect(result.current.selectedPerson).toBeNull()
    expect(result.current.filterControlsProps.people).toHaveLength(3)
    expect(result.current.ageFiltered).toEqual(items)
    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Photos 3 of 3')
  }
})

test('Clear all removes map, person, and age while retaining the selected photo identifier', () => {
  navigation.params = new URLSearchParams({ query: 'person:"Casey Example" && age:21', bbox: '5,5,15,15' })
  const { result, rerender } = renderHook((props: Persons.ItemData) => usePersonsFilter(props), { initialProps: pageData() })
  render(result.current.searchBox)
  expect(result.current.ageFiltered).toEqual([items[0]])
  fireEvent.click(screen.getByRole('button', { name: 'Clear all' }))
  const url = navigation.router.replace.mock.lastCall![0] as string
  navigation.params = new URLSearchParams(url.split('?')[1] ?? '')
  rerender(pageData())
  expect(navigation.params.has('query')).toBe(false)
  expect(navigation.params.has('bbox')).toBe(false)
  expect(navigation.params.get('select')).toBe(items[0].filename)
  expect(result.current.selectedPerson).toBeNull()
  expect(result.current.selectedAge).toBeNull()
  expect(result.current.ageFiltered).toEqual(items)
})

test('All persons retains age and map constraints and a thumbnail selects the matching filtered photo', () => {
  navigation.params = new URLSearchParams({ query: 'person:"Casey Example" && age:21', bbox: '5,5,25,25' })
  const { result, rerender } = renderHook((props: Persons.ItemData) => usePersonsFilter(props), { initialProps: pageData() })
  act(() => result.current.setSelectedPerson(null))
  const url = navigation.router.replace.mock.lastCall![0] as string
  navigation.params = new URLSearchParams(url.split('?')[1] ?? '')
  rerender(pageData())
  expect(navigation.params.get('query')).toBe('age:21')
  expect(navigation.params.get('bbox')).toBe('5,5,25,25')
  expect(result.current.ageFiltered).toEqual(items.slice(0, 2))
  act(() => result.current.selectionCoordinator.selectId(items[1].id, { origin: 'thumbnail' }))
  expect(result.current.selectionCoordinator.getSnapshot().item?.id).toBe(items[1].id)
  expect(result.current.memoryIndex).toBe(1)
})

test('clearing map bounds restores the unbounded photo total before server navigation', () => {
  navigation.params = new URLSearchParams({ bbox: '5,5,15,15' })
  const { result } = renderHook(() => usePersonsFilter({
    gallery: 'demo', items, initialBaseScopeItems: items, indexedKeywords: [],
    totalItemCount: 1, unboundedTotalCount: 3,
  }))
  const controls = render(result.current.searchBox)
  expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Photos 1 of 1')
  fireEvent.click(screen.getByRole('button', { name: 'Clear map filter' }))
  controls.rerender(result.current.searchBox)
  expect(result.current.ageFiltered).toEqual(items)
  expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Photos 3 of 3')
})

test('completed history navigation restores person and age controls from the URL', () => {
  const { result, rerender } = renderHook((props: Persons.ItemData) => usePersonsFilter(props), { initialProps: pageData() })
  navigation.params = new URLSearchParams({ query: 'person:"Casey Example" && age:21' })
  rerender(pageData())
  expect(result.current.selectedAge).toBe(21)
  expect(result.current.selectedPerson).toBe('Casey Example')
  expect(result.current.ageFiltered).toEqual([items[0]])
  navigation.params = new URLSearchParams()
  rerender(pageData())
  expect(result.current.selectedAge).toBeNull()
  expect(result.current.selectedPerson).toBeNull()
  expect(result.current.ageFiltered).toEqual(items)
})
