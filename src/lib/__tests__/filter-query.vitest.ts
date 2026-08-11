import { describe, expect, test } from 'vitest'

import {
  filterItemsByQuery,
  formatFilterQuery,
  getFilterQueryContext,
  parseFilterQuery,
} from '../filter-query'

const context = getFilterQueryContext({
  locationOptions: [{
    value: 'Canada',
    visitedPlace: { country: 'Canada', region: null },
  }],
  personOptions: [{ value: 'Alice Example' }],
  indexedKeywords: [{ label: 'best^ (2)', value: 'best^', filterKind: 'tag' }, {
    label: 'highlight^ (2)', value: 'highlight^', filterKind: 'tag',
  }],
})

describe('filter query', () => {
  test('classifies an unprefixed mixed query and gives AND precedence over OR', () => {
    const query = parseFilterQuery('Canada && best^ || Canada && highlight^', context)

    expect(formatFilterQuery(query)).toBe('country:Canada && tag:best^ || country:Canada && tag:highlight^')
  })

  test('filters a mixed country and tag query', () => {
    const query = parseFilterQuery('Canada && (best^ || highlight^)', context)
    const items = [
      { corpus: 'Canada best', search: 'best^', city: 'Toronto, Canada', filename: '2026-01-01-best.jpg' },
      { corpus: 'Canada highlight', search: 'highlight^', city: 'Vancouver, Canada', filename: '2026-01-02-highlight.jpg' },
      { corpus: 'Canada other', search: 'other^', city: 'Ottawa, Canada', filename: '2026-01-03-other.jpg' },
      { corpus: 'US best', search: 'best^', city: 'Seattle, USA', filename: '2026-01-04-best.jpg' },
    ]

    expect(filterItemsByQuery(items, query)).toEqual([items[0], items[1]])
  })

  test('keeps person and age predicates bound to the same depicted person', () => {
    const query = parseFilterQuery('person:"Alice Example" && age:10', context)
    const items = [
      {
        corpus: 'Alice and Bob',
        search: 'Alice Example, Bob Example',
        filename: '2010-06-02-a.jpg',
        photoDate: '2010-06-02',
        persons: [{ full: 'Alice Example', dob: '2000-06-01' }, { full: 'Bob Example', dob: '2000-01-01' }],
      },
      {
        corpus: 'Alice and Bob',
        search: 'Alice Example, Bob Example',
        filename: '2010-06-02-b.jpg',
        photoDate: '2010-06-02',
        persons: [{ full: 'Alice Example', dob: '2001-06-03' }, { full: 'Bob Example', dob: '2000-01-01' }],
      },
    ]

    expect(filterItemsByQuery(items, query)).toEqual([items[0]])
  })

  test('uses exact years and supports unknown ages', () => {
    const items = [
      {
        corpus: 'first',
        search: 'best^',
        filename: '2026-01-01-a.jpg',
        photoDate: '2026-01-01',
        persons: [{ full: 'Alice Example', dob: null }],
      },
      {
        corpus: 'second',
        search: 'best^',
        filename: '2025-01-01-a.jpg',
        photoDate: '2025-01-01',
        persons: [{ full: 'Alice Example', dob: '2000-01-01' }],
      },
    ]

    expect(filterItemsByQuery(items, parseFilterQuery('2026 && age:unknown', context))).toEqual([items[0]])
  })

  test('keeps ambiguous values as text', () => {
    const ambiguousContext = { ...context, tags: ['Canada'] }

    expect(formatFilterQuery(parseFilterQuery('Canada', ambiguousContext))).toBe('Canada')
  })

  test('round-trips quoted values containing backslashes and quotes', () => {
    const term = { type: 'term' as const, kind: 'person' as const, value: 'Alice\\"Admin" || person:Bob' }

    expect(parseFilterQuery(formatFilterQuery(term))).toEqual(term)
  })

  test('serializes typed values containing query syntax', () => {
    const query = {
      type: 'and' as const,
      children: [
        { type: 'term' as const, kind: 'country' as const, value: 'Congo (DRC)' },
        { type: 'term' as const, kind: 'region' as const, value: 'West && Central' },
      ],
    }

    expect(formatFilterQuery(query)).toBe('country:"Congo (DRC)" && region:"West && Central"')
    expect(parseFilterQuery(formatFilterQuery(query))).toEqual(query)
  })
})
