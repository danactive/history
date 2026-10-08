import { auditCriticalTags } from '../critical-tags'
import { buildVisitedRegionCountryIndex, getVisitedPlace, type CountryVisit } from '../visited-core'
import { validateVisits } from '../../components/VisitedMap/validation-core'
import { resolveMapCountry } from '../../components/VisitedMap/regions'
import type { Gallery, RawXmlItem } from '../../types/common'
import type { Inventory, SourceAlbum } from './sources'
import { digest } from './files'
import { primaryFilename, type CurationRow, type Finding } from './model'

export const detectorVersion = 2
export const albumKey = (album: Pick<SourceAlbum, 'gallery' | 'album'>) => `${album.gallery}/${album.album}`

export function analyze(data: Inventory, checkedAt: string, onlyAlbums?: Set<string>) {
  const rows = new Map<string, CurationRow[]>()
  const errors = [...data.errors]
  const audit = auditCriticalTags(data.albums.map(album => ({
    gallery: album.gallery as Gallery,
    album: { name: album.album, h1: album.title, h2: '', version: '', year: '', thumbPath: '', search: null },
    items: album.items.map(item => ({ search: item.search ?? null })),
  })), data.tags)
  for (const gallery of new Set(data.albums.map(album => album.gallery))) {
    const albums = data.albums.filter(album => album.gallery === gallery)
    const context = buildVisitedRegionCountryIndex(albums.flatMap(album => album.items.map(item => ({ city: item.photo_city }))))
    const placeOf = (item: RawXmlItem) => getVisitedPlace({ city: item.photo_city }, context)
    const countries = new Map<string, CountryVisit>()
    for (const item of albums.flatMap(album => album.items)) {
      const place = placeOf(item)
      if (!place) continue
      const country = countries.get(place.country) ?? {
        country: place.country, count: 0, years: [], filter: { country: place.country, region: null }, regions: [],
      }
      country.count++
      if (place.region && !country.regions.some(region => region.region === place.region)) {
        country.regions.push({ region: place.region, count: 1, years: [], filter: place })
      }
      countries.set(place.country, country)
    }
    for (const country of countries.keys()) {
      const supported = resolveMapCountry(country)
      if (supported && !data.boundaries[supported]?.data) errors.push(`Region validation unavailable for ${country} (${gallery})`)
    }
    const warnings = validateVisits([...countries.values()], data.boundaries)
    for (const album of albums) {
      if (onlyAlbums && !onlyAlbums.has(albumKey(album))) continue
      const found: CurationRow[] = []
      const allPlaces = new Set<string>()
      for (const item of album.items) {
        const place = placeOf(item)
        const parts = item.photo_city.split(',').map(part => part.trim())
        const structured = parts.length === 3 && place
        const labels = structured
          ? [place.country, place.region, ...parts.slice(0, -2), item.photo_loc].filter(Boolean)
          : [item.photo_city || item.photo_loc ? 'Unclassified place' : 'Unknown location', item.photo_city, item.photo_loc].filter(Boolean)
        const label = labels.join(' / ')
        allPlaces.add(label)
        const source = {
          gallery, album: album.album, itemId: item.$.id, filename: primaryFilename(item.filename), revision: album.revision,
        }
        const id = digest(JSON.stringify([gallery, album.album, item.$.id, source.filename]))
        const findings: Finding[] = []
        const add = (finding: Omit<Finding, 'id'>) => findings.push({ ...finding, id: digest(`${id}/${finding.category}/${finding.reason}`) })
        const video = item.type === 'video' || /\.(mp4|webm|mov)$/i.test(source.filename)
        if (!video && !item.photo_desc?.trim()) {
          add({ category: 'description', reason: 'Description opportunity', evidence: 'This photo has no description.', candidates: [] })
        }
        for (const warning of warnings) {
          if (!place) continue
          const sameCountry = warning.country === place.country
            || (resolveMapCountry(warning.country) !== null && resolveMapCountry(warning.country) === resolveMapCountry(place.country))
          const value = warning.field === 'country' ? place.country : place.region
          if (!sameCountry || !value || !warning.names?.includes(value)) continue
          const candidates = warning.candidates ?? []
          const finding: Omit<Finding, 'id'> = { category: 'location', reason: warning.kind, evidence: warning.message, candidates }
          const part = warning.field === 'country' ? parts.length - 1 : parts.length - 2
          // Only an explicit city, region, country tuple supports a safe field replacement.
          if (parts.length === 3 && parts[part] === value && candidates.length === 1 && candidates[0] !== value) {
            const replacement = [...parts]
            replacement[part] = candidates[0]
            finding.suggestion = { field: 'photo_city', original: item.photo_city, proposed: replacement.join(', ') }
          }
          add(finding)
        }
        if (findings.length) found.push({
          id, source, scope: video ? 'video' : 'photo', title: item.thumb_caption || source.filename,
          places: [label], findings, checkedAt,
        })
      }
      const coverage = audit.albums.find(value => value.gallery === gallery && value.album.name === album.album)
      if (data.tags.length && coverage && (!coverage.criticalMediaCount || coverage.isBelowMedian)) {
        const id = digest(`${albumKey(album)}/album`)
        found.push({
          id, source: { gallery, album: album.album, revision: album.revision }, scope: 'album', title: album.title,
          places: [...allPlaces].length ? [...allPlaces] : ['Unknown location'], checkedAt,
          findings: [{
            id: digest(`${id}/tags`), category: 'tags', candidates: [],
            reason: coverage.criticalMediaCount ? 'Below-median tag opportunity' : 'No critical-tag coverage',
            evidence: `${coverage.criticalMediaCount} tagged media; covered-album median ${audit.medianCriticalMediaCount}. Whole-album opportunity.`,
          }],
        })
      }
      rows.set(albumKey(album), found)
    }
  }
  return { rows, errors: [...new Set(errors)] }
}
