import { describe, expect, test } from 'vitest'

import { buildFilterMetadata, buildLocationOptions } from '../server/filter-metadata'

describe('filter metadata composer', () => {
  const items = [
    {
      city: 'Vancouver, BC, Canada',
      filename: '2024-01-01-01.jpg',
      photoDate: '2024-01-01',
      persons: [{ full: 'Taylor Example' }],
      search: 'concert^, Taylor Example, 2024',
    },
    {
      city: 'Toronto, ON, Canada',
      filename: '2023-01-01-01.jpg',
      photoDate: '2023-01-01',
      persons: [{ full: 'Jordan Sample' }],
      search: 'memory^, Jordan Sample, 2023',
    },
  ]

  test('builds location options from visited data', () => {
    const options = buildLocationOptions(items)

    expect(options.map(option => option.value)).toContain('Canada')
  })

  test('includes an abbreviated province in server-side location options', () => {
    const options = buildLocationOptions([
      {
        city: 'Banff National Park, AB, Canada',
        filename: '2021-07-03-37.jpg',
        photoDate: '2021-07-03',
      },
    ])

    expect(options).toEqual(expect.arrayContaining([
      expect.objectContaining({
        value: 'AB, Canada',
        visitedPlace: { country: 'Canada', region: 'AB' },
      }),
    ]))
  })

  test('puts server-sorted visited options before non-location search keywords', () => {
    const metadata = buildFilterMetadata([
      ...Array.from({ length: 3 }, (_, index) => ({
        city: 'Banff National Park, AB, Canada',
        filename: `2021-07-03-${index}.jpg`,
        photoDate: '2021-07-03',
        search: null,
        persons: null,
      })),
      ...Array.from({ length: 9 }, (_, index) => ({
        city: 'Yoho National Park, BC, Canada',
        filename: `2021-07-04-${index}.jpg`,
        photoDate: '2021-07-04',
        search: null,
        persons: null,
      })),
    ])

    expect(metadata.indexedKeywords.slice(0, 3).map(option => option.value)).toEqual([
      'Canada',
      'BC, Canada',
      'AB, Canada',
    ])
  })

  test('builds indexed keywords and typed buckets from a scoped corpus', () => {
    const metadata = buildFilterMetadata(items)

    expect(metadata.indexedKeywords.map(option => option.value)).toEqual(expect.arrayContaining(['2024', '2023', 'concert^', 'memory^']))
    expect(metadata.personCounts).toEqual(expect.arrayContaining([
      { name: 'Jordan Sample', count: 1 },
      { name: 'Taylor Example', count: 1 },
    ]))
    expect(metadata.personOptions.map(option => option.value)).toEqual(expect.arrayContaining(['Jordan Sample', 'Taylor Example']))
    expect(metadata.yearOptions.map(option => option.value)).toEqual(expect.arrayContaining(['2024', '2023']))
    expect(metadata.tagOptions.map(option => option.value)).toEqual(expect.arrayContaining(['concert^', 'memory^']))
  })

  test('includes every person from a multi-person item', () => {
    const metadata = buildFilterMetadata([{
      city: '',
      filename: '2024-01-01-01.jpg',
      photoDate: '2024-01-01',
      persons: [{ full: 'Taylor Example' }, { full: 'Jordan Sample' }],
      search: 'Taylor Example, Jordan Sample',
    }])

    expect(metadata.personOptions.map(option => option.value)).toEqual(expect.arrayContaining([
      'Taylor Example',
      'Jordan Sample',
    ]))
  })

  test('classifies search-only tags and people from server metadata', () => {
    const metadata = buildFilterMetadata([
      {
        city: '',
        filename: '2026-01-01-01.jpg',
        photoDate: '2026-01-01',
        persons: null,
        search: 'tag^, First Middle Last, 2026',
      },
    ])

    expect(metadata.indexedKeywords).toEqual(expect.arrayContaining([
      expect.objectContaining({ value: 'tag^', filterKind: 'tag' }),
      expect.objectContaining({ value: 'First Middle Last', filterKind: 'person' }),
    ]))
    expect(metadata.tagOptions).toEqual([
      expect.objectContaining({ value: 'tag^', filterKind: 'tag' }),
    ])
    expect(metadata.personOptions).toEqual([
      { label: 'First Middle Last (1)', value: 'First Middle Last', count: 1 },
    ])
  })
})
