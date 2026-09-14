import { describe, expect, test } from 'vitest'

import type { ServerSideAllItem } from '../../types/common'
import { derivePersonsAgeSummary } from '../persons-age-summary'

describe('persons age summary', () => {
  test('deduplicates age buckets, sorts unknown first, and counts unnamed photos in the total', () => {
    const items = [{
      filename: '2021-02-01-01.jpg', photoDate: '2021-02-01',
      persons: [
        { full: 'Alice Example', dob: '2000-01-01' },
        { full: 'Bob Example', dob: '2000-01-01' },
        { full: 'Casey Example', dob: null },
        { full: 'Drew Example', dob: null },
        { full: 'Elliot Example', dob: '2010-01-01' },
      ],
    }, { filename: '2021-02-02-01.jpg', photoDate: '2021-02-02', persons: null }] as ServerSideAllItem[]
    expect(derivePersonsAgeSummary({ ageSummaryItems: items, selectedPerson: null, canReuseServerSummary: false })).toEqual({
      agesWithCounts: [{ age: 'unknown', count: 1 }, { age: 11, count: 1 }, { age: 21, count: 1 }],
      hasUnknown: true, numericAges: [11, 21], totalPhotoCount: 2,
    })
  })
  test('excludes photos taken before a person was born', () => {
    const items = [{
      filename: '2020-01-01-01.jpg',
      photoDate: '2020-01-01',
      persons: [{ full: 'Taylor Example', dob: '2021-01-01' }],
    }] as ServerSideAllItem[]

    expect(derivePersonsAgeSummary({
      ageSummaryItems: items,
      selectedPerson: null,
      canReuseServerSummary: false,
    })).toEqual({
      agesWithCounts: [],
      hasUnknown: false,
      numericAges: [],
      totalPhotoCount: 1,
    })
  })

  test('counts only the selected person’s age in a shared photo', () => {
    const items = [{
      filename: '2021-02-01-01.jpg',
      photoDate: '2021-02-01',
      persons: [
        { full: 'Example Child', dob: '2013-01-01' },
        { full: 'Example Adult', dob: '1970-01-01' },
      ],
    }] as ServerSideAllItem[]

    expect(derivePersonsAgeSummary({
      ageSummaryItems: items,
      selectedPerson: 'Example Child',
      canReuseServerSummary: false,
    })).toEqual({
      agesWithCounts: [{ age: 8, count: 1 }],
      hasUnknown: false,
      numericAges: [8],
      totalPhotoCount: 1,
    })
  })

  test('includes age zero in the Persons age menu', () => {
    const items = [{
      filename: '2021-02-01-01.jpg',
      photoDate: '2021-02-01',
      persons: [{ full: 'Newborn', dob: '2021-01-01' }],
    }] as ServerSideAllItem[]

    expect(derivePersonsAgeSummary({
      ageSummaryItems: items,
      selectedPerson: null,
      canReuseServerSummary: false,
    })).toEqual({
      agesWithCounts: [{ age: 0, count: 1 }],
      hasUnknown: false,
      numericAges: [0],
      totalPhotoCount: 1,
    })
  })
})
