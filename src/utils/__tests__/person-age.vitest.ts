import { describe, expect, test } from 'vitest'

import { buildAgeSummary, calcAgeAtDate, resolvePhotoDate } from '../person-age'
import type { Item } from '../../types/common'

describe('person-age utilities', () => {
  test('calcAgeAtDate handles before birthday correctly', () => {
    expect(calcAgeAtDate('2000-06-10', '2020-06-09')).toBe(19)
    expect(calcAgeAtDate('2000-06-10', '2020-06-10')).toBe(20)
  })

  test('allows large ages without capping', () => {
    expect(calcAgeAtDate('1900-01-01', '2025-01-01')).toBe(125)
  })

  test('rejects non-YYYY-MM-DD DOB parsing', () => {
    expect(calcAgeAtDate('10-06-2000', '2020-06-10')).toBeNull()
  })

  test('resolvePhotoDate prefers photoDate over filename prefix', () => {
    const item = {
      photoDate: '2020-01-01',
      filename: '2019-12-31-50.jpg',
    } as Pick<Item, 'photoDate' | 'filename'>
    expect(resolvePhotoDate(item)).toBe('2020-01-01')
  })

  test('buildAgeSummary aggregates ages from persons', () => {
    const items: Item[] = [
      {
        id: '1',
        filename: '2020-06-10-50.jpg',
        photoDate: '2020-06-10',
        city: '',
        location: null,
        caption: '',
        description: null,
        search: null,
        persons: [{ full: 'A', dob: '2000-06-10' }],
        title: '',
        coordinates: null,
        coordinateAccuracy: null,
        thumbPath: '',
        photoPath: '',
        mediaPath: '',
        videoPaths: null,
        reference: null,
      },
      {
        id: '2',
        filename: '2021-06-10-50.jpg',
        photoDate: '2021-06-10',
        city: '',
        location: null,
        caption: '',
        description: null,
        search: null,
        persons: [{ full: 'A', dob: '2000-06-10' }],
        title: '',
        coordinates: null,
        coordinateAccuracy: null,
        thumbPath: '',
        photoPath: '',
        mediaPath: '',
        videoPaths: null,
        reference: null,
      },
    ]

    expect(buildAgeSummary(items)).toEqual({
      ages: [
        { age: 20, count: 1 },
        { age: 21, count: 1 },
      ],
      totalPhotoCount: 2,
    })
  })

  test('buildAgeSummary counts each age once per photo', () => {
    const items: Item[] = [
      {
        id: '1',
        filename: '2021-06-10-50.jpg',
        photoDate: '2021-06-10',
        city: '',
        location: null,
        caption: '',
        description: null,
        search: null,
        persons: [
          { full: 'Alice', dob: '2000-06-10' },
          { full: 'Bob', dob: '2000-01-01' },
          { full: 'Mystery', dob: null },
          { full: 'Unknown Twin', dob: null },
        ],
        title: '',
        coordinates: null,
        coordinateAccuracy: null,
        thumbPath: '',
        photoPath: '',
        mediaPath: '',
        videoPaths: null,
        reference: null,
      },
    ]

    expect(buildAgeSummary(items)).toEqual({
      ages: [
        { age: 'unknown', count: 1 },
        { age: 21, count: 1 },
      ],
      totalPhotoCount: 1,
    })
  })

  test('buildAgeSummary can scope counts to a selected person within shared photos', () => {
    const items: Item[] = [
      {
        id: '1',
        filename: '2021-06-10-50.jpg',
        photoDate: '2021-06-10',
        city: '',
        location: null,
        caption: '',
        description: null,
        search: null,
        persons: [
          { full: 'Alice', dob: '2000-06-10' },
          { full: 'Bob', dob: '1990-01-01' },
        ],
        title: '',
        coordinates: null,
        coordinateAccuracy: null,
        thumbPath: '',
        photoPath: '',
        mediaPath: '',
        videoPaths: null,
        reference: null,
      },
    ]

    expect(buildAgeSummary(items, 'Alice')).toEqual({
      ages: [
        { age: 21, count: 1 },
      ],
      totalPhotoCount: 1,
    })
  })
})

