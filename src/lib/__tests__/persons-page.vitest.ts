import { describe, expect, test, vi } from 'vitest'

import { getPersonsMenuBaseQuery, getPersonsPageData } from '../persons-page'

vi.mock('../persons', () => ({
  __esModule: true,
  getPersonsData: vi.fn(async () => ({
    items: [
      {
        id: '1',
        filename: '2026-01-01-01.jpg',
        photoDate: '2026-01-01',
        city: 'Demo City, Demo Country',
        location: null,
        caption: 'Caption',
        description: null,
        search: 'tag^, First Middle Last, 2026',
        persons: null,
        title: 'Title',
        coordinates: null,
        coordinateAccuracy: 0,
        thumbPath: '',
        photoPath: '',
        mediaPath: '',
        videoPaths: null,
        reference: null,
        corpus: 'tag^ First Middle Last 2026',
        visitedPlace: { country: 'Demo Country', region: 'Demo Region' },
        gallery: 'demo',
      },
    ],
    indexedKeywords: [
      { label: 'tag^ (1)', value: 'tag^' },
      { label: 'First Middle Last (1)', value: 'First Middle Last' },
      { label: '2026 (1)', value: '2026' },
    ],
  })),
  filterPersonsItems: vi.fn((items) => items),
}))

describe('persons page data', () => {
  test('uses only non-person predicates as the menu baseline', () => {
    expect(getPersonsMenuBaseQuery(
      'country:Canada && tag:best^ && person:"Alice Example" && age:21',
      { countries: ['Canada'], tags: ['best^'], people: ['Alice Example'] },
    )).toBe('country:Canada && tag:best^')
  })

  test('keeps scoped persons search options backend-classified', async () => {
    const result = await getPersonsPageData({
      gallery: 'demo',
      selectedAge: null,
      selectedPerson: null,
      searchParams: { query: 'country:"Demo Country"' },
    })

    expect(result.indexedKeywords).toEqual(expect.arrayContaining([
      expect.objectContaining({ value: 'tag^', filterKind: 'tag' }),
      expect.objectContaining({ value: 'First Middle Last', filterKind: 'person' }),
      expect.objectContaining({ value: '2026', filterKind: 'year' }),
    ]))
  })
})
