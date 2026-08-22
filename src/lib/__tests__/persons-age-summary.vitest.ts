import { describe, expect, test } from 'vitest'

import type { ServerSideAllItem } from '../../types/common'
import { derivePersonsAgeSummary } from '../persons-age-summary'

describe('persons age summary', () => {
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
