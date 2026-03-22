import type { Item } from '../types/common'

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
  const filenameDate = Array.isArray(item.filename)
    ? (item.filename[0] ?? '').substring(0, 10)
    : String(item.filename ?? '').substring(0, 10)
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

export function buildAgeSummary(items: Item[]): { ages: { age: number; count: number }[] } {
  const counts = new Map<number, number>()
  items.forEach((it) => {
    if (!it.persons || !it.filename) return
    const photoDate = resolvePhotoDate(it)
    it.persons.forEach((p) => {
      if (!p.dob) return
      const age = calcAgeAtDate(p.dob, photoDate)
      if (age !== null && age >= 0) counts.set(age, (counts.get(age) || 0) + 1)
    })
  })
  return {
    ages: Array.from(counts.entries())
      .map(([age, count]) => ({ age, count }))
      .sort((a, b) => a.age - b.age),
  }
}

