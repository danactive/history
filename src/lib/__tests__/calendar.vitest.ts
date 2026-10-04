import { describe, expect, test, vi } from 'vitest'

import { buildCalendarMonths, getCalendarPhotoCounts } from '../calendar'

describe('calendar library', () => {
  test('starts January 1 on Monday and marks available dates', () => {
    const months = buildCalendarMonths({ '01-01': 2, '02-29': 1 })
    const january = months[0]
    const february = months[1]

    expect(january?.weeks[0]?.[0]).toEqual({ day: 1, monthDay: '01-01', hasPhotos: true, photoCount: 2 })
    expect(january?.weeks[0]?.[1]).toEqual({ day: 2, monthDay: '01-02', hasPhotos: false, photoCount: 0 })
    expect(february?.weeks.flat().find((date) => date?.monthDay === '02-29')).toEqual({
      day: 29,
      monthDay: '02-29',
      hasPhotos: true,
      photoCount: 1,
    })
  })

  test('includes every month and every possible day', () => {
    const months = buildCalendarMonths({})
    const dates = months.flatMap((month) => month.weeks.flat()).filter(Boolean)

    expect(months).toHaveLength(12)
    expect(dates).toHaveLength(366)
    expect(dates.at(-1)).toMatchObject({ monthDay: '12-31' })
  })
})

const loaders = vi.hoisted(() => ({ getOrderedAlbumItems: vi.fn(), applyGalleryItemsCachePolicy: vi.fn() }))
vi.mock('../get-all-items', () => loaders)

test('counts across albums and years with Today date semantics and gallery isolation', async () => {
  loaders.getOrderedAlbumItems.mockImplementation(async (gallery: string) => gallery === 'demo' ? [
    { items: [{ filename: '2023-01-05-a.jpg' }, { filename: 'other.jpg', photoDate: '2024-02-29' }] },
    { items: [{ filename: '2025-01-05-a.mp4' }, { filename: '2025-12-31-a.jpg', photoDate: '2025-01-05' }] },
  ] : [])
  expect(await getCalendarPhotoCounts('demo')).toEqual({ '01-05': 3, '02-29': 1 })
  expect(await getCalendarPhotoCounts('empty' as Parameters<typeof getCalendarPhotoCounts>[0])).toEqual({})
  expect(loaders.applyGalleryItemsCachePolicy).toHaveBeenCalledWith('demo')
  expect(loaders.applyGalleryItemsCachePolicy).toHaveBeenCalledWith('empty')
})
