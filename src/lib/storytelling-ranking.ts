import type { PersonCount, StoryMoment, StorySearchSchemaInput } from '../models/storytelling'
import type { VisitedPlace } from '../types/common'
import { getPrimaryFilename } from '../utils'
import { matchesVisitedPlace } from './visited'
import type { StoryCandidate } from './storytelling-candidates'

const normalize = (value: string | null | undefined) => (value ?? '').trim().toLowerCase()

const tokenize = (value: string | null | undefined) => normalize(value)
  .split(/[^a-z0-9]+/)
  .filter(Boolean)

const unique = <T>(values: T[]) => [...new Set(values)]

const compareDatesDescending = (left: string | null, right: string | null) => {
  if (left === right) return 0
  if (left === null) return 1
  if (right === null) return -1
  return right.localeCompare(left)
}

const sortValuesByFrequency = (values: string[], limit: number) => {
  const counts = new Map<string, number>()

  values
    .filter(Boolean)
    .forEach((value) => {
      counts.set(value, (counts.get(value) ?? 0) + 1)
    })

  return [...counts.entries()]
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .slice(0, limit)
    .map(([value]) => value)
}

const countValuesByFrequency = (values: string[], limit: number): PersonCount[] => {
  const counts = new Map<string, number>()

  values
    .filter(Boolean)
    .forEach((value) => {
      counts.set(value, (counts.get(value) ?? 0) + 1)
    })

  return [...counts.entries()]
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .slice(0, limit)
    .map(([name, count]) => ({ name, count }))
}

const buildHaystack = (item: StoryCandidate) => normalize([
  item.album,
  item.filename,
  item.date,
  item.title,
  item.caption,
  item.description,
  item.city,
  item.location,
  item.visitedPlace?.region,
  item.visitedPlace?.country,
  item.persons.join(' '),
].join(' '))

const matchesRegionOnly = (place: VisitedPlace | null, region: string) => {
  if (!place?.region) return false
  return normalize(place.region) === normalize(region)
}

const getVisitedPlaceFilter = (input: StorySearchSchemaInput): VisitedPlace | null => {
  if (!input.country) return null
  return {
    country: input.country,
    region: input.region ?? null,
  }
}

const storyRichness = (candidate: StoryCandidate) => {
  let score = 0

  if (candidate.caption) score += 2
  if (candidate.description) score += 2
  if (candidate.location) score += 1
  if (candidate.city) score += 1
  if (candidate.reference) score += 1
  score += Math.min(candidate.persons.length, 3)

  return score
}

function scoreCandidate(candidate: StoryCandidate, input: StorySearchSchemaInput): StoryMoment | null {
  const haystack = buildHaystack(candidate)
  const reasons: string[] = []
  let score = 0

  const queryTokens = tokenize(input.query)
  if (queryTokens.length > 0) {
    const matchedTokens = queryTokens.filter(token => haystack.includes(token))
    if (matchedTokens.length === 0) {
      return null
    }

    score += matchedTokens.length * 4
    reasons.push(`matched query terms: ${unique(matchedTokens).join(', ')}`)
  }

  if (input.person) {
    const match = candidate.persons.find(person => normalize(person).includes(normalize(input.person)))
    if (!match) {
      return null
    }

    score += 6
    reasons.push(`includes person: ${match}`)
  }

  if (input.city) {
    const cityMatch = [candidate.city, candidate.location]
      .filter(Boolean)
      .find(value => normalize(value).includes(normalize(input.city)))

    if (!cityMatch) {
      return null
    }

    score += 5
    reasons.push(`matches place: ${cityMatch}`)
  }

  if (input.country || input.region) {
    const visitedFilter = getVisitedPlaceFilter(input)
    const locationMatch = visitedFilter
      ? matchesVisitedPlace(candidate.visitedPlace, visitedFilter)
      : matchesRegionOnly(candidate.visitedPlace, input.region as string)

    if (!locationMatch) {
      return null
    }

    score += input.country && input.region ? 7 : 5
    reasons.push(
      input.country && input.region
        ? `matches visited place: ${input.region}, ${input.country}`
        : input.country
          ? `matches country: ${input.country}`
          : `matches region: ${input.region}`,
    )
  }

  if (input.year) {
    const date = candidate.date ?? getPrimaryFilename(candidate.filename)
    if (!date.startsWith(input.year)) {
      return null
    }

    score += 5
    reasons.push(`matches year: ${input.year}`)
  }

  if (input.album) {
    if (normalize(candidate.album) !== normalize(input.album)) {
      return null
    }

    score += 3
    reasons.push(`matches album: ${candidate.album}`)
  }

  score += storyRichness(candidate)

  if (reasons.length === 0) {
    reasons.push('selected as a rich storytelling candidate')
  }

  return {
    ...candidate,
    score,
    reasons,
  }
}

export {
  compareDatesDescending,
  countValuesByFrequency,
  getVisitedPlaceFilter,
  scoreCandidate,
  sortValuesByFrequency,
  storyRichness,
}
