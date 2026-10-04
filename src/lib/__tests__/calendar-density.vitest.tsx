import { render, screen } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'
import type { AnchorHTMLAttributes } from 'react'
import CalendarView from '../../../app/[gallery]/calendar/calendar-view'
import { buildCalendarMonths } from '../calendar'
import { buildCalendarDensityBands, getCalendarDensity } from '../calendar-density'

vi.mock('../../components/Link', () => ({
  default: (props: AnchorHTMLAttributes<HTMLAnchorElement>) => <a {...props} />,
}))

describe('calendar density', () => {
  test.each([1, 2, 6, 7, 50, 347, 1500, 9876])('scales all boundaries to a maximum of %i', (max) => {
    const bands = buildCalendarDensityBands(max)
    expect(bands.at(-1)?.min).toBeLessThanOrEqual(max)
    expect(bands.at(-1)?.min).toBeGreaterThanOrEqual(max * 0.9)
    expect(getCalendarDensity(max, bands)?.background).toBe('#9E1B35')
    expect(new Set(bands.map((band) => band.min)).size).toBe(bands.length)
    for (const [index, band] of bands.entries()) {
      expect(getCalendarDensity(band.min, bands)).toBe(band)
      if (index > 0) expect(getCalendarDensity(band.min - 1, bands)).toBe(bands[index - 1])
    }
  })

  test('rounds the top down and handles empty galleries', () => {
    expect(buildCalendarDensityBands(347).at(-1)?.label).toBe('340+')
    expect(buildCalendarDensityBands(0)).toEqual([])
    expect(getCalendarDensity(0, [])).toBeUndefined()
    expect(buildCalendarDensityBands(1)).toHaveLength(1)
  })

  test('leaves zero neutral and keeps all foregrounds readable', () => {
    expect(getCalendarDensity(0, buildCalendarDensityBands(50))).toBeUndefined()
    for (const band of buildCalendarDensityBands(50)) {
      const rgb = [1, 3, 5].map((offset) => parseInt(band.background.slice(offset, offset + 2), 16) / 255)
      const linear = rgb.map((v) => v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)
      const luminance = linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722
      const contrast = band.foreground === '#FFFFFF' ? 1.05 / (luminance + 0.05) : (luminance + 0.05) / 0.05
      expect(contrast).toBeGreaterThanOrEqual(4.5)
    }
  })

  test('renders counts, legend, empty dates and compatible encoded links', () => {
    const { container } = render(<CalendarView gallery="demo sample" months={buildCalendarMonths({ '01-01': 1, '02-29': 50 })} />)
    expect(screen.getByRole('link', { name: 'January 1, 1 photo, view photos' }).getAttribute('href')).toBe('/demo%20sample/today?day=01-01')
    expect(screen.getByRole('link', { name: 'February 29, 50 photos, view photos' }).getAttribute('href')).toBe('/demo%20sample/today?day=02-29')
    expect(screen.getAllByRole('link')).toHaveLength(2)
    expect(screen.getByText('January 1: 1 photo')).toBeTruthy()
    expect(screen.getByRole('list', { name: 'Photos per date' }).children).toHaveLength(8)
    expect(screen.getByText('50+')).toBeTruthy()
    expect(container.querySelectorAll('td > span')).toHaveLength(364)
    expect([...container.querySelectorAll('td')].filter((cell) => !cell.textContent).length).toBeGreaterThan(0)
  })
})
