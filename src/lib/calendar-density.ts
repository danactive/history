import type { CSSProperties } from 'react'
import { mapMarkerClusterStops } from '../components/SlippyMap/marker-theme'

function foreground(background: string): string {
  const channels = background.slice(1).match(/../g)!.map((hex) => {
    const value = parseInt(hex, 16) / 255
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
  })
  const luminance = channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722
  return (luminance + 0.05) / 0.05 >= 1.05 / (luminance + 0.05) ? '#000000' : '#FFFFFF'
}

export function buildCalendarDensityBands(maxCount: number) {
  if (maxCount <= 0) return []

  // Round down to two significant digits so the busiest date reaches the top band.
  const step = 10 ** Math.max(0, Math.floor(Math.log10(maxCount)) - 1)
  const top = Math.max(1, Math.floor(maxCount / step) * step)
  const bandCount = Math.min(mapMarkerClusterStops.length, top)
  const bands = Array.from({ length: bandCount }, (_, index) => {
    const fraction = bandCount === 1 ? 1 : index / (bandCount - 1)
    const min = bandCount === 1 ? 1 : 1 + Math.floor(fraction * (top - 1))
    const background = mapMarkerClusterStops[Math.round(fraction * (mapMarkerClusterStops.length - 1))][1]
    return { min, background, foreground: foreground(background) }
  })
  return bands.map((band, index) => {
    const next = bands[index + 1]?.min
    const label = next === undefined ? `${band.min}+`
      : next === band.min + 1 ? `${band.min}` : `${band.min}–${next - 1}`
    return { ...band, label }
  })
}

export type CalendarDensityBands = ReturnType<typeof buildCalendarDensityBands>

export function getCalendarDensity(count: number, bands: CalendarDensityBands) {
  return count > 0 ? bands.findLast((band) => count >= band.min) : undefined
}

export function calendarDensityStyle(count: number, bands: CalendarDensityBands): CSSProperties {
  const band = getCalendarDensity(count, bands)
  return band ? {
    '--date-background': band.background,
    '--date-foreground': band.foreground,
  } as CSSProperties : {}
}

export function photoCountLabel(count: number): string {
  return `${count} ${count === 1 ? 'photo' : 'photos'}`
}
