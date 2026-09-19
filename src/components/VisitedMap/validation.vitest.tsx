import { readFileSync } from 'node:fs'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, expect, it } from 'vitest'
import type { CountryVisit } from '../../lib/visited-core'
import { validateVisits } from './validation-core'
import ValidationWarnings from './validation'
import { markVisitedRegions, type RegionCollection } from './regions'
const Canada: RegionCollection = JSON.parse(readFileSync('public/maps/visited/canada.geojson', 'utf8'))
const visit = (country: string, regions: string[]): CountryVisit => ({
  country, count: 1, years: ['2020'], filter: { country, region: null },
  regions: regions.map(region => ({ region, count: 1, years: ['2020'], filter: { country, region } })),
})
afterEach(cleanup)
it('reports typos without painting guesses and counts duplicate aliases once', () => {
  const countries = [visit('Canada', ['BC', 'British Columbia', 'Ontaro', 'Toronto']), visit('Canad', []), visit('France', [])]
  const warnings = validateVisits(countries, { Canada: { data: Canada } })
  expect(warnings).toHaveLength(4)
  expect(warnings.find(w => w.kind === 'Possible country typo')?.message).toContain('Canada')
  expect(warnings.find(w => w.message.includes('Ontaro'))?.message).toContain('Ontario')
  expect(warnings.find(w => w.kind === 'Duplicate region names')?.message).toContain('counts this division once')
  expect(markVisitedRegions(Canada, ['BC', 'British Columbia', 'Ontaro']).count).toBe(1)
  expect(warnings.some(w => w.country === 'France')).toBe(false)
})
it('recognizes country spelling variants and duplicate region names in unsupported countries', () => {
  const warnings = validateVisits([visit('Mexico', []), visit('México', []), visit('France', ['Paris', 'paris'])], {})
  expect(warnings.map(w => w.kind)).toEqual(['Duplicate country names', 'Duplicate region names'])
})
it('distinguishes unavailable validation from a clean result', () => {
  render(<ValidationWarnings countries={[visit('Canada', ['Ontario'])]} loaded={{ Canada: { error: true } }} />)
  expect(screen.getByText('Region validation unavailable for Canada.')).toBeTruthy()
  expect(screen.queryByText('No issues found in the names checked.')).toBeNull()
})
it('shows warnings with context and no automatic metadata changes', () => {
  render(<ValidationWarnings countries={[visit('Canada', ['Ontaro'])]} loaded={{ Canada: { data: Canada } }} />)
  expect(screen.getByRole('heading', { name: 'Location validation' })).toBeTruthy()
  expect(screen.getByText('1 location warning')).toBeTruthy()
  expect(screen.getByText(/Possible match: “Ontario”/)).toBeTruthy()
})
