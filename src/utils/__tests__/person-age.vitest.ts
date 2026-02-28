import { describe, expect, test } from 'vitest'

import { buildAgeSummary, calcAgeAtDate, resolvePhotoDate } from '../person-age'
import type { Item } from '../../types/common'

describe('person-age utilities', () => {
  test('calcAgeAtDate handles before birthday correctly', () => {
    expect(calcAgeAtDate('2000-06-10', '2020-06-09')).toBe(19)
    expect(calcAgeAtDate('2000-06-10', '2020-06-10')).toBe(20)
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
    })
  })
})

