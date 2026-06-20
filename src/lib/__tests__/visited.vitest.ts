import { describe, expect, test } from 'vitest'

import { buildVisitedDataFromItems, formatVisitedYears } from '../visited'

describe('visited location aggregation', () => {
  test('groups explicit photo_city values by country, region, and year without fixed subdivision lists', () => {
    const result = buildVisitedDataFromItems([
      { city: 'Saskatoon, SK, Canada', filename: '1987-01-01-01.jpg', photoDate: null },
      { city: 'Honolulu, Hawaii, USA', filename: '1988-01-01-01.jpg', photoDate: null },
      { city: 'England', filename: '1999-01-01-01.jpg', photoDate: null },
      { city: 'Toronto, ON, Canada', filename: '2001-01-01-01.jpg', photoDate: null },
      { city: 'Toronto, ON, Canada', filename: '2018-01-01-01.jpg', photoDate: null },
      { city: 'Miami, Florida, USA', filename: '2004-01-01-01.jpg', photoDate: null },
      { city: 'Austin, Texas, USA', filename: '2016-01-01-01.jpg', photoDate: null },
    ])

    expect(result).toEqual([
      {
        country: 'Canada',
        years: [],
        regions: [
          { region: 'ON', years: ['2001', '2018'] },
          { region: 'SK', years: ['1987'] },
        ],
      },
      {
        country: 'USA',
        years: [],
        regions: [
          { region: 'Florida', years: ['2004'] },
          { region: 'Hawaii', years: ['1988'] },
          { region: 'Texas', years: ['2016'] },
        ],
      },
      {
        country: 'England',
        years: ['1999'],
        regions: [],
      },
    ])
  })

  test('learns two-part region countries from explicit locations in the same data', () => {
    const result = buildVisitedDataFromItems([
      { city: 'Vancouver, British Columbia, Canada', filename: '2025-01-01-01.jpg', photoDate: null },
      { city: 'Victoria, BC', filename: '2024-01-01-01.jpg', photoDate: null },
      { city: 'Portland, Oregon, United States', filename: '2017-01-01-01.jpg', photoDate: null },
    ])

    expect(result).toEqual([
      {
        country: 'USA',
        years: [],
        regions: [{ region: 'Oregon', years: ['2017'] }],
      },
      {
        country: 'Canada',
        years: [],
        regions: [
          { region: 'BC', years: ['2024'] },
          { region: 'British Columbia', years: ['2025'] },
        ],
      },
    ])
  })

  test('does not invent countries for two-part places without an explicit country signal', () => {
    const result = buildVisitedDataFromItems([
      { city: 'Vancouver, BC', filename: '2001-01-01-01.jpg', photoDate: null },
      { city: 'Vancouver, BC', filename: '2004-01-01-01.jpg', photoDate: null },
    ])

    expect(result).toEqual([
      {
        country: 'BC',
        years: ['2001', '2004'],
        regions: [],
      },
    ])
  })

  test('excludes unknown and non-numeric years', () => {
    const result = buildVisitedDataFromItems([
      { city: 'Canada', filename: 'photo.jpg', photoDate: null },
      { city: 'Canada', filename: 'NaN-photo.jpg', photoDate: null },
      { city: 'Canada', filename: '2010-01-01-01.jpg', photoDate: null },
    ])

    expect(result).toEqual([
      {
        country: 'Canada',
        years: ['2010'],
        regions: [],
      },
    ])
  })

  test('formats consecutive years as ranges', () => {
    expect(formatVisitedYears(['2015', '2018', '2019', '2020', '2021'])).toBe('2015, 2018-2021')
    expect(formatVisitedYears(['Unknown', 'NaN', '2020', '2019', '2019'])).toBe('2019-2020')
  })
})
