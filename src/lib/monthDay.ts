import * as z from 'zod/v4'

import { formatFilterQuery } from './filter-query'
import config from '../models/config'
import type { Gallery } from '../types/common'

export function getGuiOrigin(origin = process.env.HISTORY_APP_ORIGIN) {
  const configuredOrigin = origin?.trim()
  return configuredOrigin ? new URL(configuredOrigin).origin : `http://localhost:${config.nextPort}`
}

export const guiOrigin = getGuiOrigin()

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

export function buildTodayPageHref(gallery: Gallery, monthDay: string) {
  const searchParams = new URLSearchParams({ day: parseMonthDay(monthDay) })
  return `${guiOrigin}/${encodeURIComponent(gallery)}/today?${searchParams.toString()}`
}

export function buildAlbumPageHref(gallery: Gallery, album: string) {
  return `${guiOrigin}/${encodeURIComponent(gallery)}/${encodeURIComponent(album)}`
}

export function buildPersonGuiHref(gallery: Gallery, name: string) {
  const query = formatFilterQuery({ type: 'term', kind: 'person', value: name })
  const searchParams = new URLSearchParams({ query })
  return `${guiOrigin}/${encodeURIComponent(gallery)}/persons?${searchParams.toString()}`
}
