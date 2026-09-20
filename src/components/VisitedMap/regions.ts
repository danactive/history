import type { FeatureCollection, MultiPolygon, Polygon } from 'geojson'

export const mapCountries = {
  'Dominican Republic': { file: 'dominican-republic', center: [-70.5, 19], total: 32, regions: 'provinces / National District' },
  Spain: { file: 'spain', center: [-3.5, 40], total: 52, regions: 'provinces / autonomous cities' },
  Italy: { file: 'italy', center: [12.5, 42], total: 20, regions: 'regions' },
  Türkiye: { file: 'turkiye', center: [35, 39], total: 81, regions: 'provinces' },
  Japan: { file: 'japan', center: [138, 37], total: 47, regions: 'prefectures' },
  USA: { file: 'usa', center: [-110, 42], total: 51, regions: 'states / DC' },
  Mexico: { file: 'mexico', center: [-102, 24], total: 32, regions: 'states / Mexico City' },
  Canada: { file: 'canada', center: [-106, 58], total: 13, regions: 'provinces / territories' },
} satisfies Record<string, { file: string, center: [number, number], total: number, regions: string }>

export type MapCountry = keyof typeof mapCountries
export type RegionCollection = FeatureCollection<Polygon | MultiPolygon, {
  id: string
  name: string
  aliases: string[]
  label: [number, number]
  labelRadius: number
  abbreviation: string
  visited?: boolean
}>

export function isMapCountry(country: string): country is MapCountry {
  return Object.hasOwn(mapCountries, country)
}

export function resolveMapCountry(country: string): MapCountry | null {
  const normalize = (value: string) => value.trim().normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()
  const name = normalize(country)
  if (name === 'turkey') return 'Türkiye'
  if (name === 'italia') return 'Italy'
  if (name === 'republica dominicana') return 'Dominican Republic'
  if (name === 'espana') return 'Spain'
  return (Object.keys(mapCountries) as MapCountry[]).find(key => normalize(key) === name) ?? null
}

export function coverageSummary(country: MapCountry, count: number) {
  const config = mapCountries[country]
  return `${count} of ${config.total} ${config.regions} visited`
}

function normalizeRegion(name: string) {
  return name.trim().normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().replace(/ı/g, 'i')
    .replace(/(?:\s+(?:prefecture|province|region)|[-\s]+(?:ken|fu|to))$/u, '')
    .replace(/[都府県]$/u, '').replace(/[^\p{L}\p{N}]/gu, '')
}

export function regionCandidates(data: RegionCollection, region: string) {
  const name = normalizeRegion(region)
  const exact = data.features.filter(({ properties }) =>
    normalizeRegion(properties.name) === name || normalizeRegion(properties.id) === name)
  return exact.length ? exact : data.features.filter(({ properties }) =>
    properties.aliases.some(alias => normalizeRegion(alias) === name))
}

export function markVisitedRegions(data: RegionCollection, regions: string[]) {
  const matched = new Set<string>()
  const unmatched: string[] = []
  for (const region of regions) {
    const candidates = regionCandidates(data, region)
    // Ambiguous aliases should never paint multiple divisions as visited.
    if (candidates.length === 1) matched.add(candidates[0].properties.id)
    else unmatched.push(region)
  }
  const features = data.features.map(feature => ({
    ...feature, properties: { ...feature.properties, visited: matched.has(feature.properties.id) },
  }))
  return {
    data: { ...data, features },
    count: features.filter(feature => feature.properties.visited).length,
    unmatched,
  }
}

// Keep the current country until another supported heading reaches the reading line.
export function countryAtReadingLine(headings: { country: MapCountry, top: number }[], readingLine: number) {
  return headings.filter(heading => heading.top <= readingLine).at(-1)?.country ?? headings[0]?.country ?? null
}
