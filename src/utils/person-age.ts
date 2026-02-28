import type { Item } from '../types/common'

export function resolvePhotoDate(item: Pick<Item, 'filename' | 'photoDate'>): string {
  const filenameDate = Array.isArray(item.filename)
    ? (item.filename[0] ?? '').substring(0, 10)
    : String(item.filename ?? '').substring(0, 10)
  return item.photoDate || filenameDate
}

export function calcAgeAtDate(dob: string, photoDate: string): number | null {
  try {
    const birth = new Date(dob.substring(0, 10))
    const shot = new Date(photoDate.substring(0, 10))
    if (Number.isNaN(birth.getTime()) || Number.isNaN(shot.getTime())) return null
    let age = shot.getFullYear() - birth.getFullYear()
    const m = shot.getMonth() - birth.getMonth()
    if (m < 0 || (m === 0 && shot.getDate() < birth.getDate())) age -= 1
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

