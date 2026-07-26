import type { ServerSideAllItem } from '../types/common'
import { calcAgeAtDate, resolvePhotoDate, type AgeSummaryValue } from '../utils/person-age'

export type PersonsAgeSummary = {
  agesWithCounts: { age: AgeSummaryValue; count: number }[]
  hasUnknown: boolean
  numericAges: number[]
  totalPhotoCount: number
}

export function derivePersonsAgeSummary({
  ageSummaryItems,
  ageSummaryPerson,
  canReuseServerSummary,
  initialAgeSummary,
}: {
  ageSummaryItems: ServerSideAllItem[]
  ageSummaryPerson: string | null
  canReuseServerSummary: boolean
  initialAgeSummary?: { ages: { age: AgeSummaryValue; count: number }[]; totalPhotoCount?: number }
}): PersonsAgeSummary {
  if (canReuseServerSummary && initialAgeSummary) {
    return {
      agesWithCounts: initialAgeSummary.ages.map(({ age, count }) => ({ age, count })),
      hasUnknown: initialAgeSummary.ages.some((entry) => entry.age === 'unknown'),
      numericAges: initialAgeSummary.ages
        .filter((entry): entry is { age: number; count: number } => entry.age !== 'unknown')
        .map((entry) => entry.age),
      totalPhotoCount: initialAgeSummary.totalPhotoCount ?? initialAgeSummary.ages.reduce((sum, { count }) => sum + count, 0),
    }
  }

  const ageCountMap = new Map<number | 'unknown', number>()
  const numericAgeSet = new Set<number>()
  let hasUnknown = false

  ageSummaryItems.forEach((item) => {
    if (!item.persons || !item.filename) {
      return
    }

    const photoDate = resolvePhotoDate(item)
    const seen = new Set<number | 'unknown'>()

    item.persons.forEach((person) => {
      if (ageSummaryPerson && person.full !== ageSummaryPerson) {
        return
      }

      if (!person.dob) {
        hasUnknown = true
        if (!seen.has('unknown')) {
          ageCountMap.set('unknown', (ageCountMap.get('unknown') || 0) + 1)
          seen.add('unknown')
        }
        return
      }

      const age = calcAgeAtDate(person.dob, photoDate)
      if (age === null || Number.isNaN(age)) {
        return
      }

      numericAgeSet.add(age)
      if (!seen.has(age)) {
        ageCountMap.set(age, (ageCountMap.get(age) || 0) + 1)
        seen.add(age)
      }
    })
  })

  const numericAges = Array.from(numericAgeSet).sort((left, right) => left - right)
  const agesWithCounts = [
    ...(hasUnknown ? [{ age: 'unknown' as const, count: ageCountMap.get('unknown') || 0 }] : []),
    ...numericAges.map((age) => ({ age: age as number | 'unknown', count: ageCountMap.get(age) || 0 })),
  ].filter((entry) => entry.count > 0)

  return {
    agesWithCounts,
    hasUnknown,
    numericAges,
    totalPhotoCount: ageSummaryItems.length,
  }
}
