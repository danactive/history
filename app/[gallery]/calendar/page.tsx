import type { Metadata } from 'next'
import { Suspense } from 'react'
import Link from '../../../src/components/Link'
import { buildCalendarMonths, getCalendarMonthDays } from '../../../src/lib/calendar'
import {
  generateGalleryStaticParams,
  type GalleryParams,
  type RouteParamsProps,
} from '../../../src/lib/server/page-route'
import styles from './styles.module.css'

const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export async function generateStaticParams() {
  return generateGalleryStaticParams()
}

export const metadata: Metadata = {
  title: 'Calendar - History App',
}

export default function CalendarServer(props: RouteParamsProps<GalleryParams>) {
  return (
    <Suspense fallback={<div>Loading calendar...</div>}>
      <CalendarServerContent {...props} />
    </Suspense>
  )
}

async function CalendarServerContent({ params }: RouteParamsProps<GalleryParams>) {
  const { gallery } = await params
  const months = buildCalendarMonths(new Set(await getCalendarMonthDays(gallery)))

  return (
    <main className={styles.page}>
      <h1>Calendar</h1>
      <p className={styles.intro}>Dates with photos link to that day in Today.</p>
      <div className={styles.months}>
        {months.map((month) => (
          <section key={month.name} className={styles.month} aria-labelledby={`${month.name}-heading`}>
            <h2 id={`${month.name}-heading`}>{month.name}</h2>
            <table className={styles.table}>
              <thead>
                <tr>
                  {weekdays.map((weekday) => <th key={weekday} scope="col">{weekday}</th>)}
                </tr>
              </thead>
              <tbody>
                {month.weeks.map((week, weekIndex) => (
                  <tr key={weekIndex}>
                    {week.map((date, weekdayIndex) => (
                      <td key={weekdayIndex} className={styles.day}>
                        {date && (date.hasPhotos
                          ? (
                            <Link
                              className={styles.dayLink}
                              href={`/${encodeURIComponent(gallery)}/today?${new URLSearchParams({ day: date.monthDay }).toString()}`}
                              aria-label={`${month.name} ${date.day}, view photos`}
                            >
                              {date.day}
                            </Link>
                          )
                          : <span>{date.day}</span>)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        ))}
      </div>
    </main>
  )
}
