import * as z from 'zod/v4'

import config from '../models/config'
import type { Gallery } from '../types/common'

export const guiOrigin = `http://localhost:${config.nextPort}`

export const monthDaySchema = z.string().regex(/^\d{2}-\d{2}$/).describe('Month-day in MM-DD format. Defaults to today.')

export type TodaySearchParams = {
  day?: string | string[]
}

export function getDefaultMonthDay(date = new Date()) {
  return date.toLocaleString('en-CA').substring(5, 10)
}

export function parseMonthDay(value: unknown) {
  return monthDaySchema.parse(value)
}

export function getMonthDayFromSearchParams(searchParams?: TodaySearchParams) {
  const day = typeof searchParams?.day === 'string' ? searchParams.day.trim() : ''
  return day ? parseMonthDay(day) : getDefaultMonthDay()
}

export function buildTodayGuiHref(gallery: Gallery, monthDay: string) {
  const searchParams = new URLSearchParams({ day: parseMonthDay(monthDay) })
  return `${guiOrigin}/${encodeURIComponent(gallery)}/today?${searchParams.toString()}`
}

export function buildPersonGuiHref(gallery: Gallery, name: string) {
  const searchParams = new URLSearchParams({ person: name })
  return `${guiOrigin}/${encodeURIComponent(gallery)}/persons/details?${searchParams.toString()}`
}
