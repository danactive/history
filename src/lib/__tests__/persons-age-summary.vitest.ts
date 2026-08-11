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
      ageSummaryPerson: null,
      canReuseServerSummary: false,
    })).toEqual({
      agesWithCounts: [],
      hasUnknown: false,
      numericAges: [],
      totalPhotoCount: 1,
    })
  })
})
