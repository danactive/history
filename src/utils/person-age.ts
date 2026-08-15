import type { Item } from '../types/common'
import { getPrimaryFilename } from '.'

export type AgeSummaryValue = number | 'unknown'

function parseDate(value: string): Date | null {
  const trimmed = value.trim().substring(0, 10)

  // Strict format: YYYY-MM-DD
  const ymd = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (ymd) {
    const year = Number.parseInt(ymd[1], 10)
    const month = Number.parseInt(ymd[2], 10)
    const day = Number.parseInt(ymd[3], 10)
    const out = new Date(year, month - 1, day)
    if (!Number.isNaN(out.getTime())) return out
  }

  return null
}

export function resolvePhotoDate(item: Pick<Item, 'filename' | 'photoDate'>): string {
  const filenameDate = getPrimaryFilename(item.filename).substring(0, 10)
  return item.photoDate || filenameDate
}

export function calcAgeAtDate(dob: string, photoDate: string): number | null {
  try {
    const birth = parseDate(dob)
    const shot = parseDate(photoDate)
    if (!birth || !shot) return null
    if (Number.isNaN(birth.getTime()) || Number.isNaN(shot.getTime())) return null
    let age = shot.getFullYear() - birth.getFullYear()
    const m = shot.getMonth() - birth.getMonth()
    if (m < 0 || (m === 0 && shot.getDate() < birth.getDate())) age -= 1
    return age
  } catch {
    return null
  }
}

export function calcAgeNow(dob: string, now: Date = new Date()): number | null {
  try {
    const birth = parseDate(dob)
    if (!birth) return null
    if (Number.isNaN(birth.getTime())) return null
    let age = now.getFullYear() - birth.getFullYear()
    const m = now.getMonth() - birth.getMonth()
    if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age -= 1
    return age
  } catch {
    return null
  }
}

export function buildAgeSummary(
  items: Item[],
  selectedPerson: string | null = null,
): { ages: { age: AgeSummaryValue; count: number }[]; totalPhotoCount: number } {
  const counts = new Map<AgeSummaryValue, number>()
  items.forEach((it) => {
    if (!it.persons || !it.filename) return
    const photoDate = resolvePhotoDate(it)
    const seenAges = new Set<AgeSummaryValue>()
    it.persons.forEach((p) => {
      if (selectedPerson && p.full !== selectedPerson) {
        return
      }

      if (!p.dob) {
        if (!seenAges.has('unknown')) {
          counts.set('unknown', (counts.get('unknown') || 0) + 1)
          seenAges.add('unknown')
        }
        return
      }
      const age = calcAgeAtDate(p.dob, photoDate)
      if (age !== null && age >= 0 && !seenAges.has(age)) {
        counts.set(age, (counts.get(age) || 0) + 1)
        seenAges.add(age)
      }
    })
  })
  return {
    ages: Array.from(counts.entries())
      .map(([age, count]) => ({ age, count }))
      .sort((left, right) => {
        if (left.age === 'unknown') return -1
        if (right.age === 'unknown') return 1
        return left.age - right.age
      }),
    totalPhotoCount: items.length,
  }
}
