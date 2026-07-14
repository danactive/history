import { describe, expect, test } from 'vitest'
import {
  buildVisitedDataFromItems,
  buildVisitedRegionCountryIndex,
  formatVisitedPlace,
  formatVisitedYears,
  getVisitedPlace,
  matchesVisitedPlace,
} from '../visited'

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
        count: 3,
        filter: { country: 'Canada', region: null },
        regions: [
          { region: 'ON', years: ['2001', '2018'], count: 2, filter: { country: 'Canada', region: 'ON' } },
          { region: 'SK', years: ['1987'], count: 1, filter: { country: 'Canada', region: 'SK' } },
        ],
      },
      {
        country: 'USA',
        years: [],
        count: 3,
        filter: { country: 'USA', region: null },
        regions: [
          { region: 'Florida', years: ['2004'], count: 1, filter: { country: 'USA', region: 'Florida' } },
          { region: 'Hawaii', years: ['1988'], count: 1, filter: { country: 'USA', region: 'Hawaii' } },
          { region: 'Texas', years: ['2016'], count: 1, filter: { country: 'USA', region: 'Texas' } },
        ],
      },
      {
        country: 'England',
        years: ['1999'],
        count: 1,
        filter: { country: 'England', region: null },
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
        count: 1,
        filter: { country: 'USA', region: null },
        regions: [{ region: 'Oregon', years: ['2017'], count: 1, filter: { country: 'USA', region: 'Oregon' } }],
      },
      {
        country: 'Canada',
        years: [],
        count: 2,
        filter: { country: 'Canada', region: null },
        regions: [
          { region: 'BC', years: ['2024'], count: 1, filter: { country: 'Canada', region: 'BC' } },
          { region: 'British Columbia', years: ['2025'], count: 1, filter: { country: 'Canada', region: 'British Columbia' } },
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
        count: 2,
        filter: { country: 'BC', region: null },
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
        count: 1,
        filter: { country: 'Canada', region: null },
        regions: [],
      },
    ])
  })

  test('derives exact visited places and matching rules for server-side filters', () => {
    const items = [
      { city: 'Nagoya, Aichi, Japan', filename: '2024-01-01-01.jpg', photoDate: null },
      { city: 'Okazaki, Aichi', filename: '2024-01-02-01.jpg', photoDate: null },
      { city: 'Tokyo, Japan', filename: '2024-01-03-01.jpg', photoDate: null },
    ]

    const regionCountryIndex = buildVisitedRegionCountryIndex(items)
    const aichi = getVisitedPlace(items[1], regionCountryIndex)
    const tokyo = getVisitedPlace(items[2], regionCountryIndex)

    expect(aichi).toEqual({ country: 'Japan', region: 'Aichi' })
    expect(tokyo).toEqual({ country: 'Japan', region: 'Tokyo' })
    expect(matchesVisitedPlace(aichi, { country: 'Japan', region: null })).toBe(true)
    expect(matchesVisitedPlace(aichi, { country: 'Japan', region: 'Aichi' })).toBe(true)
    expect(matchesVisitedPlace(aichi, { country: 'Japan', region: 'Tokyo' })).toBe(false)
    expect(formatVisitedPlace({ country: 'Japan', region: 'Aichi' })).toBe('Aichi, Japan')
    expect(formatVisitedPlace({ country: 'Japan', region: null })).toBe('Japan')
  })

  test('treats two-part city-country values as region plus country', () => {
    const items = [
      { city: 'Lisbon, Portugal', filename: '2024-01-03-01.jpg', photoDate: null },
    ]

    const regionCountryIndex = buildVisitedRegionCountryIndex(items)
    const lisbon = getVisitedPlace(items[0], regionCountryIndex)

    expect(lisbon).toEqual({ country: 'Portugal', region: 'Lisbon' })
    expect(formatVisitedPlace(lisbon!)).toBe('Lisbon, Portugal')
  })

  test('formats consecutive years as ranges', () => {
    expect(formatVisitedYears(['2015', '2018', '2019', '2020', '2021'])).toBe('2015, 2018-2021')
    expect(formatVisitedYears(['Unknown', 'NaN', '2020', '2019', '2019'])).toBe('2019-2020')
  })
})
