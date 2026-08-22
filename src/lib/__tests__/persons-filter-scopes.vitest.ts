import { describe, expect, test } from 'vitest'

import {
  derivePeople,
  derivePersonsScopes,
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
  test('combines age and person only for the visible photos', () => {
    const items = [
      makeItem('1', [{ full: 'Alice', dob: '2000-01-01' }], '2021-02-01'),
      makeItem('2', [{ full: 'Bob', dob: '2000-05-01' }], '2021-06-01'),
      makeItem('3', [{ full: 'Alice', dob: '1979-01-01' }], '2021-02-01'),
    ]

    const scopes = derivePersonsScopes({
      items,
      selectedAge: 21,
      effectiveSelectedPerson: 'Alice',
    })

    expect(scopes.ageBaseFiltered).toEqual([items[0], items[1]])
    expect(scopes.ageFiltered).toEqual([items[0]])
  })

  test('derives the people menu from people at the selected age only', () => {
    const items = [
      makeItem('1', [
        { full: 'Example One', dob: '2000-01-01' },
        { full: 'Example Two', dob: '1979-01-01' },
      ], '2021-02-01'),
      makeItem('2', [{ full: 'Example Two', dob: '2000-05-01' }], '2021-06-01'),
    ]

    expect(derivePeople(items, 21)).toEqual({
      people: ['Example One', 'Example Two'],
      peopleWithCounts: [
        { name: 'Example One', count: 1 },
        { name: 'Example Two', count: 1 },
      ],
    })
  })

  test('matches exact person and age combinations', () => {
    const item = makeItem('1', [{ full: 'Alice', dob: '2000-01-01' }], '2021-02-01')

    expect(matchesSelectedPersonAge(item, null, 'Alice')).toBe(true)
    expect(matchesSelectedPersonAge(item, 21, 'Alice')).toBe(true)
    expect(matchesSelectedPersonAge(item, 20, 'Alice')).toBe(false)
    expect(matchesSelectedPersonAge(item, null, 'Bob')).toBe(false)
  })

  test('matches age zero for the selected person', () => {
    const item = makeItem('1', [{ full: 'Example Child', dob: '2021-01-01' }], '2021-02-01')

    expect(matchesSelectedPersonAge(item, 0, 'Example Child')).toBe(true)
    expect(derivePersonsScopes({
      items: [item],
      selectedAge: 0,
      effectiveSelectedPerson: 'Example Child',
    }).ageFiltered).toEqual([item])
  })
})
