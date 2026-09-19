import type { CountryVisit } from '../../lib/visited-core'
import { mapCountries, regionCandidates, resolveMapCountry } from './regions'
import type { BoundaryState } from './use-boundaries'

export type ValidationWarning = { kind: string, country: string, message: string }
const normalize = (name: string) => name.trim().normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().replace(/[^\p{L}\p{N}]/gu, '')
const quoted = (names: string[]) => names.map(name => `“${name}”`).join(', ')

function distance(a: string, b: string) {
  let row = Array.from({ length: b.length + 1 }, (_, i) => i)
  for (let i = 1; i <= a.length; i++) {
    const next = [i]
    for (let j = 1; j <= b.length; j++) {
      next[j] = Math.min(next[j - 1] + 1, row[j] + 1, row[j - 1] + Number(a[i - 1] !== b[j - 1]))
    }
    row = next
  }
  return row[b.length]
}

function suggestions(name: string, choices: { name: string, aliases: string[] }[]) {
  const value = normalize(name)
  if (value.length < 4) return [] // Short codes are too ambiguous for spelling guesses.
  const scored = choices.map(choice => ({ name: choice.name, score: Math.min(...[choice.name, ...choice.aliases]
    .map(normalize).filter(alias => alias.length >= 4).map(alias => distance(value, alias))) }))
  const best = Math.min(...scored.map(choice => choice.score))
  return best <= (value.length >= 7 ? 2 : 1) ? scored.filter(choice => choice.score === best).map(choice => choice.name).slice(0, 3) : []
}

export function validateVisits(countries: CountryVisit[], loaded: BoundaryState): ValidationWarning[] {
  const warnings: ValidationWarning[] = []
  const groups = new Map<string, CountryVisit[]>()
  for (const country of countries) {
    const key = resolveMapCountry(country.country) ?? normalize(country.country)
    groups.set(key, [...(groups.get(key) ?? []), country])
    if (!resolveMapCountry(country.country)) {
      const candidates = suggestions(country.country, Object.keys(mapCountries).map(name => ({ name, aliases: [] })))
      if (candidates.length) warnings.push({ kind: 'Possible country typo', country: country.country,
        message: `${quoted([country.country])}: did you mean ${quoted(candidates)}? This entry is not mapped.` })
    }
  }
  for (const visits of groups.values()) {
    const country = visits[0].country
    const supported = resolveMapCountry(country)
    const data = supported ? loaded[supported]?.data : undefined
    if (visits.length > 1) warnings.push({ kind: 'Duplicate country names', country,
      message: `${quoted(visits.map(visit => visit.country))} identify the same country.`
        + (supported ? ' Map coverage combines their regions.' : '') })
    const regionGroups = new Map<string, { names: string[], name: string, mapped: boolean }>()
    for (const region of visits.flatMap(visit => visit.regions)) {
      const matches = data ? regionCandidates(data, region.region) : []
      const key = matches.length === 1 ? matches[0].properties.id : normalize(region.region)
      const group = regionGroups.get(key) ?? {
        names: [], name: matches.length === 1 ? matches[0].properties.name : region.region, mapped: matches.length === 1,
      }
      group.names.push(region.region)
      regionGroups.set(key, group)
      if (data && matches.length !== 1) {
        const candidates = matches.length ? matches.map(match => match.properties.name)
          : suggestions(region.region, data.features.map(feature => feature.properties))
        warnings.push({ kind: matches.length ? 'Ambiguous region' : 'Unmapped region', country,
          message: `${quoted([region.region])} is not highlighted.${candidates.length ? ` Possible match: ${quoted(candidates)}.`
            : ' It may be a city, a typo, or a name outside the administrative dataset.'}` })
      }
    }
    for (const group of regionGroups.values()) if (group.names.length > 1) {
      warnings.push({ kind: 'Duplicate region names', country,
        message: `${quoted(group.names)} identify ${group.name}. `
          + (group.mapped ? 'Matched map coverage counts this division once.' : 'Review these duplicate spellings.') })
    }
  }
  return warnings
}
