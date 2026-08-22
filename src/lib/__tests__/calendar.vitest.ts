import { describe, expect, test } from 'vitest'

import { buildCalendarMonths } from '../calendar'

describe('calendar library', () => {
  test('starts January 1 on Monday and marks available dates', () => {
    const months = buildCalendarMonths(new Set(['01-01', '02-29']))
    const january = months[0]
    const february = months[1]

    expect(january?.weeks[0]?.[0]).toEqual({ day: 1, monthDay: '01-01', hasPhotos: true })
    expect(january?.weeks[0]?.[1]).toEqual({ day: 2, monthDay: '01-02', hasPhotos: false })
    expect(february?.weeks.flat().find((date) => date?.monthDay === '02-29')).toEqual({
      day: 29,
      monthDay: '02-29',
      hasPhotos: true,
    })
  })

  test('includes every month and every possible day', () => {
    const months = buildCalendarMonths(new Set())
    const dates = months.flatMap((month) => month.weeks.flat()).filter(Boolean)

    expect(months).toHaveLength(12)
    expect(dates).toHaveLength(366)
    expect(dates.at(-1)).toMatchObject({ monthDay: '12-31' })
  })
})
