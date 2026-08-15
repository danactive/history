import { applyGalleryItemsCachePolicy, getOrderedAlbumItems } from './get-all-items'
import { getItemMonthDay } from './today'
import type { Gallery } from '../types/common'

const months = [
  { name: 'January', days: 31 },
  { name: 'February', days: 29 },
  { name: 'March', days: 31 },
  { name: 'April', days: 30 },
  { name: 'May', days: 31 },
  { name: 'June', days: 30 },
  { name: 'July', days: 31 },
  { name: 'August', days: 31 },
  { name: 'September', days: 30 },
  { name: 'October', days: 31 },
  { name: 'November', days: 30 },
  { name: 'December', days: 31 },
] as const

export type CalendarDay = {
  day: number
  monthDay: string
  hasPhotos: boolean
}

export type CalendarMonth = {
  name: string
  weeks: Array<Array<CalendarDay | null>>
}

/**
 * Returns a calendar for every possible date, treating January 1 as a Monday.
 * February 29 is included so leap-day photos are reachable.
 */
export function buildCalendarMonths(availableMonthDays: ReadonlySet<string>): CalendarMonth[] {
  let weekday = 0

  return months.map(({ name, days }, monthIndex) => {
    const weeks: Array<Array<CalendarDay | null>> = []
    let week: Array<CalendarDay | null> = Array(7).fill(null)

    for (let day = 1; day <= days; day += 1) {
      const monthDay = `${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      week[weekday] = { day, monthDay, hasPhotos: availableMonthDays.has(monthDay) }
      weekday = (weekday + 1) % 7

      if (weekday === 0) {
        weeks.push(week)
        week = Array(7).fill(null)
      }
    }

    if (weekday !== 0) weeks.push(week)

    return { name, weeks }
  })
}

export async function getCalendarMonthDays(gallery: Gallery): Promise<string[]> {
  'use cache'

  applyGalleryItemsCachePolicy(gallery)

  const albums = await getOrderedAlbumItems(gallery)
  return [...new Set(albums.flatMap(({ items }) => items.map(getItemMonthDay)))]
}
