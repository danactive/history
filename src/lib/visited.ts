import type { Gallery, Item, VisitedPlace } from '../types/common'
import getAlbum from './album'
import getAlbums from './albums'

type RegionVisit = {
  region: string
  years: string[]
  count: number
  filter: VisitedPlace
}

type CountryVisit = {
  country: string
  years: string[]
  count: number
  filter: VisitedPlace
  regions: RegionVisit[]
}

type VisitAccumulator = {
  years: Set<string>
  regions: Map<string, RegionAccumulator>
  count: number
  firstYear: number
}

type RegionAccumulator = {
  years: Set<string>
  count: number
}

type ParsedVisitedPlace = VisitedPlace

type ExplicitVisitedPlace = {
  country: string
  region: string
}

const COUNTRY_ALIASES = new Map([
  ['ca', 'Canada'],
  ['canada', 'Canada'],
  ['us', 'USA'],
  ['u.s.', 'USA'],
  ['u.s.a.', 'USA'],
  ['usa', 'USA'],
  ['united states', 'USA'],
  ['united states of america', 'USA'],
])

function normalizeKey(value: string) {
  return value.trim().toLowerCase()
}

function normalizeCountry(value: string) {
  const trimmed = value.trim()
  return COUNTRY_ALIASES.get(normalizeKey(trimmed)) ?? trimmed
}

function normalizeRegion(value: string | null) {
  const trimmed = value?.trim() ?? ''
  return trimmed.length > 0 ? trimmed : null
}

function regionInitials(region: string) {
  const words = region.match(/\p{L}+/gu) ?? []
  if (words.length < 2) return null
  return words.map(word => word[0]).join('').toUpperCase()
}

function splitPlace(city: string) {
  const parts = city.split(',').map(part => part.trim()).filter(Boolean)
  if (parts.length === 0) return null
  return parts
}

function getExplicitPlace(parts: string[]): ExplicitVisitedPlace | null {
  if (parts.length < 3) return null

  const region = parts.at(-2)
  const country = parts.at(-1)

  if (!region || !country) return null

  return {
    country: normalizeCountry(country),
    region,
  }
}

function buildRegionCountryIndex(places: string[][]) {
  const index = new Map<string, string>()

  places.forEach((parts) => {
    const explicit = getExplicitPlace(parts)
    if (!explicit) return

    index.set(normalizeKey(explicit.region), explicit.country)

    const initials = regionInitials(explicit.region)
    if (initials) {
      index.set(normalizeKey(initials), explicit.country)
    }
  })

  return index
}

export function buildVisitedRegionCountryIndex(items: Pick<Item, 'city'>[]) {
  const places = items
    .map(item => splitPlace(item.city))
    .filter((parts): parts is string[] => parts !== null)

  return buildRegionCountryIndex(places)
}

function parseVisitedPlace(parts: string[], regionCountryIndex: Map<string, string>): ParsedVisitedPlace | null {
  if (parts.length === 1) {
    return { country: normalizeCountry(parts[0]), region: null }
  }

  if (parts.length === 2) {
    const region = parts[1]
    const country = regionCountryIndex.get(normalizeKey(region))
    if (country) return { country, region }

    return { country: normalizeCountry(region), region: null }
  }

  return getExplicitPlace(parts)
}

export function getVisitedPlace(
  item: Pick<Item, 'city'>,
  regionCountryIndex: Map<string, string>,
): VisitedPlace | null {
  const parts = splitPlace(item.city)
  if (!parts) return null

  const place = parseVisitedPlace(parts, regionCountryIndex)
  if (!place?.country) return null

  return {
    country: normalizeCountry(place.country),
    region: normalizeRegion(place.region),
  }
}

export function matchesVisitedPlace(place: VisitedPlace | null, filter: VisitedPlace) {
  if (!place) return false

  const normalizedFilter = {
    country: normalizeCountry(filter.country),
    region: normalizeRegion(filter.region),
  }

  if (place.country !== normalizedFilter.country) {
    return false
  }

  if (normalizedFilter.region === null) {
    return true
  }

  return place.region === normalizedFilter.region
}

export function formatVisitedPlace(place: VisitedPlace) {
  return place.region ? `${place.region}, ${place.country}` : place.country
}

function itemYear(item: Pick<Item, 'filename' | 'photoDate'>) {
  const dateYear = item.photoDate?.match(/^\d{4}/)?.[0]
  if (dateYear) return dateYear

  const filename = Array.isArray(item.filename) ? item.filename[0] : item.filename
  return filename?.match(/^\d{4}/)?.[0] ?? null
}

function isValidYear(year: string | null): year is string {
  return year !== null && /^\d{4}$/.test(year) && Number.isFinite(Number(year))
}

function compareYears(left: string, right: string) {
  return Number(left) - Number(right)
}

function compareFirstYears(left: number, right: number) {
  return left - right
}

function addVisit(visited: Map<string, VisitAccumulator>, country: string, region: string | null, year: string) {
  const numericYear = Number(year)
  const current = visited.get(country) ?? {
    years: new Set<string>(),
    regions: new Map<string, RegionAccumulator>(),
    count: 0,
    firstYear: numericYear,
  }

  if (numericYear < current.firstYear) {
    current.firstYear = numericYear
  }

  current.count += 1

  if (!region) {
    current.years.add(year)
    visited.set(country, current)
    return
  }

  const regionVisit = current.regions.get(region) ?? {
    years: new Set<string>(),
    count: 0,
  }
  regionVisit.years.add(year)
  regionVisit.count += 1
  current.regions.set(region, regionVisit)
  visited.set(country, current)
}

export function formatVisitedYears(years: string[]) {
  const sortedYears = [...new Set(years.filter(isValidYear))].sort(compareYears)
  const ranges: string[] = []

  for (let i = 0; i < sortedYears.length; i += 1) {
    const start = Number(sortedYears[i])
    let end = start

    while (i + 1 < sortedYears.length && Number(sortedYears[i + 1]) === end + 1) {
      i += 1
      end = Number(sortedYears[i])
    }

    ranges.push(start === end ? String(start) : `${start}-${end}`)
  }

  return ranges.join(', ')
}

export function buildVisitedDataFromItems(items: Pick<Item, 'city' | 'filename' | 'photoDate'>[]): CountryVisit[] {
  const visited = new Map<string, VisitAccumulator>()
  const regionCountryIndex = buildVisitedRegionCountryIndex(items)

  items.forEach((item) => {
    const year = itemYear(item)
    if (!isValidYear(year)) return

    const place = getVisitedPlace(item, regionCountryIndex)
    if (!place) return

    const { country, region } = place
    if (!country) return

    addVisit(visited, country, region, year)
  })

  return [...visited.entries()]
    .sort(([, left], [, right]) => compareFirstYears(left.firstYear, right.firstYear))
    .map(([country, visit]) => ({
      country,
      years: [...visit.years].sort(compareYears),
      count: visit.count,
      filter: { country, region: null },
      regions: [...visit.regions.entries()]
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([region, regionVisit]) => ({
          region,
          years: [...regionVisit.years].sort(compareYears),
          count: regionVisit.count,
          filter: { country, region },
        })),
    }))
}

export async function getVisitedData(gallery: Gallery): Promise<CountryVisit[]> {
  const { [gallery]: { albums } } = await getAlbums(gallery)
  const albumItems = await Promise.all(albums.map(async (album) => {
    const { album: { items } } = await getAlbum(gallery, album.name)
    return items
  }))

  return buildVisitedDataFromItems(albumItems.flat())
}

export type {
  CountryVisit,
  RegionVisit
}

export type { VisitedPlace }
