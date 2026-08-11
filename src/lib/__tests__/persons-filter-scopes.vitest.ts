import { describe, expect, test } from 'vitest'

import {
  derivePeopleAtSelectedAge,
  derivePersonsScopes,
  getAgeSummaryPerson,
  getServerScopedPerson,
  matchesSelectedPersonAge,
} from '../persons-filter-scopes'
import type { ServerSideAllItem } from '../../types/common'

function makeItem(id: string, people: Array<{ full: string; dob: string | null }>, photoDate: string): ServerSideAllItem {
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
    persons: people,
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

describe('persons filter scopes', () => {
  test('scopes server-side person filtering only when age is not active', () => {
    expect(getServerScopedPerson(null, 'Alice')).toBe('Alice')
    expect(getServerScopedPerson(21, 'Alice')).toBeNull()
  })

  test('anchors age summary to the active person whenever a person filter is active', () => {
    expect(getAgeSummaryPerson(null, 'Alice')).toBe('Alice')
    expect(getAgeSummaryPerson(21, 'Alice')).toBeNull()
  })

  test('derives person-scoped age totals when no age filter is active', () => {
    const items = [
      makeItem('1', [{ full: 'Alice', dob: '2000-01-01' }], '2021-02-01'),
      makeItem('2', [{ full: 'Bob', dob: '1990-01-01' }], '2021-02-01'),
    ]

    const scopes = derivePersonsScopes({
      items,
      selectedAge: null,
      effectiveSelectedPerson: 'Alice',
      canReuseServerScope: false,
    })

    expect(scopes.ageSummaryPerson).toBe('Alice')
    expect(scopes.ageSummaryItems).toEqual([items[0]])
    expect(scopes.ageBaseFiltered).toEqual(items)
    expect(scopes.ageFiltered).toEqual([items[0]])
  })

  test('keeps age base scope broad while scoping age summaries to the active person', () => {
    const items = [
      makeItem('1', [{ full: 'Alice', dob: '2000-01-01' }], '2021-02-01'),
      makeItem('2', [{ full: 'Bob', dob: '2000-05-01' }], '2021-06-01'),
    ]

    const scopes = derivePersonsScopes({
      items,
      selectedAge: 21,
      effectiveSelectedPerson: 'Alice',
      canReuseServerScope: false,
    })

    expect(scopes.ageSummaryPerson).toBeNull()
    expect(scopes.ageSummaryItems).toEqual(items)
    expect(scopes.ageBaseFiltered).toEqual(items)
    expect(scopes.ageFiltered).toEqual([items[0]])
  })

  test('derives people available at the selected age from the age-only scope', () => {
    const items = [
      makeItem('1', [{ full: 'Alice', dob: '2000-01-01' }], '2021-02-01'),
      makeItem('2', [{ full: 'Bob', dob: '2000-05-01' }], '2021-06-01'),
    ]

    const derived = derivePeopleAtSelectedAge(items, 21)

    expect(derived.peopleAtSelectedAge).toEqual(['Alice', 'Bob'])
    expect(derived.peopleWithCounts).toEqual([
      { name: 'Alice', count: 1 },
      { name: 'Bob', count: 1 },
    ])
  })

  test('derives all people across the current scope when no age is selected', () => {
    const items = [
      makeItem('1', [{ full: 'Alice', dob: '2000-01-01' }], '2021-02-01'),
      makeItem('2', [{ full: 'Bob', dob: '2000-05-01' }], '2021-06-01'),
      makeItem('3', [{ full: 'Alice', dob: '2000-01-01' }], '2021-07-01'),
    ]

    const derived = derivePeopleAtSelectedAge(items, null)

    expect(derived.peopleAtSelectedAge).toEqual(['Alice', 'Bob'])
    expect(derived.peopleWithCounts).toEqual([
      { name: 'Alice', count: 2 },
      { name: 'Bob', count: 1 },
    ])
  })

  test('matches exact person and age combinations', () => {
    const item = makeItem('1', [{ full: 'Alice', dob: '2000-01-01' }], '2021-02-01')

    expect(matchesSelectedPersonAge(item, null, 'Alice')).toBe(true)
    expect(matchesSelectedPersonAge(item, 21, 'Alice')).toBe(true)
    expect(matchesSelectedPersonAge(item, 20, 'Alice')).toBe(false)
    expect(matchesSelectedPersonAge(item, null, 'Bob')).toBe(false)
  })
})
