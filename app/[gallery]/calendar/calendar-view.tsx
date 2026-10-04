import Link from '../../../src/components/Link'
import type { CalendarMonth } from '../../../src/lib/calendar'
import { buildCalendarDensityBands, calendarDensityStyle, photoCountLabel } from '../../../src/lib/calendar-density'
import styles from './styles.module.css'

const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function CalendarView({ gallery, months }: { gallery: string, months: CalendarMonth[] }) {
  const maxCount = Math.max(0, ...months.flatMap((month) => month.weeks.flat().map((date) => date?.photoCount ?? 0)))
  const calendarDensityBands = buildCalendarDensityBands(maxCount)

  return (
    <main className={styles.page}>
      <h1>Calendar</h1>
      <p className={styles.intro}>
        Photos by date across all years. Colours scale to the busiest date in this gallery.
        {' '}Dates with photos link to that day in Today.
      </p>
      <ul className={styles.legend} aria-label="Photos per date">
        <li><span className={styles.swatch} aria-hidden="true" />0</li>
        {calendarDensityBands.map((band) => (
          <li key={band.min}>
            <span className={styles.swatch} style={calendarDensityStyle(band.min, calendarDensityBands)} aria-hidden="true" />
            {band.label}
          </li>
        ))}
      </ul>
      <div className={styles.months}>
        {months.map((month) => (
          <section key={month.name} className={styles.month} aria-labelledby={`${month.name}-heading`}>
            <h2 id={`${month.name}-heading`}>{month.name}</h2>
            <table className={styles.table}>
              <thead><tr>{weekdays.map((weekday) => <th key={weekday} scope="col">{weekday}</th>)}</tr></thead>
              <tbody>
                {month.weeks.map((week, weekIndex) => (
                  <tr key={weekIndex}>
                    {week.map((date, weekdayIndex) => (
                      <td key={weekdayIndex} className={styles.day}>
                        {date && (date.hasPhotos ? (
                          <Link
                            className={styles.dayLink}
                            style={calendarDensityStyle(date.photoCount, calendarDensityBands)}
                            href={`/${encodeURIComponent(gallery)}/today?${new URLSearchParams({ day: date.monthDay }).toString()}`}
                            aria-label={`${month.name} ${date.day}, ${photoCountLabel(date.photoCount)}, view photos`}
                          >
                            {date.day}
                            <span className={styles.countLabel} aria-hidden="true">
                              {month.name} {date.day}: {photoCountLabel(date.photoCount)}
                            </span>
                          </Link>
                        ) : <span className={styles.emptyDay}>{date.day}</span>)}
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
