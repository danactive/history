import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import {
  countryAtReadingLine, coverageSummary, mapCountries, markVisitedRegions, resolveMapCountry, type MapCountry, type RegionCollection,
} from './regions'

function boundaries(country: MapCountry): RegionCollection {
  return JSON.parse(readFileSync(`public/maps/visited/${mapCountries[country].file}.geojson`, 'utf8'))
}

describe('visited boundary matching', () => {
  it('places every label inside its region with unique IDs and abbreviations', () => {
    const insideRing = (point: number[], ring: number[][]) => {
      let inside = false
      for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
        const [x, y] = ring[i], [px, py] = ring[j]
        if ((y > point[1]) !== (py > point[1]) && point[0] < (px - x) * (point[1] - y) / (py - y) + x) inside = !inside
      }
      return inside
    }
    const all = (Object.keys(mapCountries) as MapCountry[]).flatMap(country => boundaries(country).features)
    expect(new Set(all.map(feature => feature.properties.id)).size).toBe(328)
    expect(new Set(all.map(feature => feature.properties.abbreviation)).size).toBe(328)
    for (const feature of all) {
      const polygons = feature.geometry.type === 'Polygon' ? [feature.geometry.coordinates] : feature.geometry.coordinates
      const contained = polygons.some(polygon => insideRing(feature.properties.label, polygon[0])
        && !polygon.slice(1).some(hole => insideRing(feature.properties.label, hole)))
      expect(contained, feature.properties.id).toBe(true)
      expect(feature.properties.labelRadius).toBeGreaterThan(0)
    }
    const anchor = (id: string) => all.find(feature => feature.properties.id === id)!.properties.label
    expect(anchor('US-AK')[0]).toBeLessThan(-130)
    expect(anchor('US-AK')[0]).toBeGreaterThan(-170)
    expect(anchor('US-HI')[0]).toBeLessThan(-154)
    expect(anchor('JP-01')[1]).toBeGreaterThan(41)
    expect(anchor('JP-47')[1]).toBeLessThan(27)
  })

  it('keeps Washington distinct from DC and uses explicit coverage totals', () => {
    const result = markVisitedRegions(boundaries('USA'), ['Washington', 'WA', 'District of Columbia', 'DC'])
    expect(result.count).toBe(2)
    expect(result.unmatched).toEqual([])
    expect(coverageSummary('USA', 2)).toBe('2 of 51 states / DC visited')
    expect(coverageSummary('Japan', 0)).toBe('0 of 47 prefectures visited')
    expect(coverageSummary('Canada', 13)).toBe('13 of 13 provinces / territories visited')
  })
  it('matches Canadian full names, accents, postal abbreviations, and ISO codes without double counting', () => {
    const result = markVisitedRegions(boundaries('Canada'), ['BC', 'British Columbia', 'Québec', 'CA-ON', 'Atlantis'])
    expect(result.count).toBe(3)
    expect(result.unmatched).toEqual(['Atlantis'])
  })

  it('matches Japanese romanization, prefecture suffixes, and Japanese names', () => {
    const result = markVisitedRegions(boundaries('Japan'), ['Osaka', 'Kyoto Prefecture', 'Tokyo-to', '北海道', 'Kanagawa-ken'])
    expect(result.count).toBe(5)
    expect(result.unmatched).toEqual([])
  })

  it('includes Hawaii and Alaska, and does not mistake cities for states', () => {
    const result = markVisitedRegions(boundaries('USA'), ['HI', 'Alaska', 'New York', 'Washington', 'Portland'])
    expect(result.count).toBe(4)
    expect(result.unmatched).toEqual(['Portland'])
    expect(markVisitedRegions(boundaries('USA'), []).count).toBe(0)
  })

  it('ships complete administrative divisions with closed polygon rings', () => {
    for (const [country, count] of [
      ['Japan', 47], ['USA', 51], ['Canada', 13], ['Mexico', 32], ['Italy', 20], ['Türkiye', 81], ['Spain', 52], ['Dominican Republic', 32],
    ] as const) {
      const data = boundaries(country)
      expect(data.features).toHaveLength(count)
      expect(new Set(data.features.map(feature => feature.properties.id)).size).toBe(count)
      for (const feature of data.features) {
        const polygons = feature.geometry.type === 'Polygon' ? [feature.geometry.coordinates] : feature.geometry.coordinates
        for (const polygon of polygons) for (const ring of polygon) {
          expect(ring.length).toBeGreaterThanOrEqual(4)
          expect(ring[0]).toEqual(ring.at(-1))
        }
      }
    }
  })
})

describe('scroll selection', () => {
  it('switches at the reading line and restores the previous country when scrolling back', () => {
    expect(countryAtReadingLine([{ country: 'Canada', top: 140 }, { country: 'USA', top: 500 }], 100)).toBe('Canada')
    expect(countryAtReadingLine([{ country: 'Canada', top: -300 }, { country: 'USA', top: 100 }], 100)).toBe('USA')
    expect(countryAtReadingLine([{ country: 'Canada', top: -299 }, { country: 'USA', top: 101 }], 100)).toBe('Canada')
    expect(countryAtReadingLine([{ country: 'Japan', top: 340 }], 350)).toBe('Japan')
    expect(countryAtReadingLine([], 100)).toBeNull()
  })
})


it('matches Mexican states and Mexico City without inferring states from cities', () => {
  expect(resolveMapCountry('México')).toBe('Mexico')
  expect(resolveMapCountry('Mexico')).toBe('Mexico')
  const result = markVisitedRegions(boundaries('Mexico'), [
    'State of Mexico', 'Estado de México', 'Mexico city', 'CDMX', 'MX-DIF',
    'Yucatan', 'Quintana Roo', 'MX-JAL', 'Guanajuato', 'Cozumel', 'Costa Maya',
  ])
  expect(result.count).toBe(6)
  expect(result.unmatched).toEqual(['Cozumel', 'Costa Maya'])
  expect(coverageSummary('Mexico', 6)).toBe('6 of 32 states / Mexico City visited')
})


it('matches Türkiye names, province suffixes, and ISO codes without inventing regional visits', () => {
  expect(resolveMapCountry('Turkey')).toBe('Türkiye')
  expect(resolveMapCountry('Türkiye')).toBe('Türkiye')
  expect(resolveMapCountry('Turkiye')).toBe('Türkiye')
  const result = markVisitedRegions(boundaries('Türkiye'), [
    'Istanbul', 'İstanbul province', 'İzmir province', 'Aydın province', 'Gümüşhane province',
    'TR-61', 'Trabzon', 'Trabzon province', 'Aegean region',
  ])
  expect(result.count).toBe(5)
  expect(result.unmatched).toEqual(['Aegean region'])
  expect(coverageSummary('Türkiye', 5)).toBe('5 of 81 provinces visited')
})

it('matches Italy regional names in English and Italian and counts aliases once', () => {
  expect(resolveMapCountry('Italia')).toBe('Italy')
  const result = markVisitedRegions(boundaries('Italy'), [
    'Tuscany', 'Toscana', 'Sicily', 'Sicilia', 'Sardegna', 'Puglia', 'Lombardia', 'Emilia-Romagna', 'Rome',
  ])
  expect(result.count).toBe(6)
  expect(result.unmatched).toEqual(['Rome'])
  expect(coverageSummary('Italy', 6)).toBe('6 of 20 regions visited')
})


it('matches Spanish province aliases without mixing community codes, cities, or islands', () => {
  expect(resolveMapCountry('España')).toBe('Spain')
  expect(resolveMapCountry('Spain')).toBe('Spain')
  const result = markVisitedRegions(boundaries('Spain'), [
    'Barcelona', 'ES-B', 'Madrid', 'València', 'Sevilla', 'Seville', 'Illes Balears', 'Baleares',
    'Guipúzcoa', 'Gipuzkoa', 'Álava', 'Araba', 'CT', 'PV', 'Mallorca', 'Palma',
  ])
  expect(result.count).toBe(7)
  expect(result.unmatched).toEqual(['CT', 'PV', 'Mallorca', 'Palma'])
  expect(coverageSummary('Spain', 7)).toBe('7 of 52 provinces / autonomous cities visited')
})

it('keeps Ceuta and Melilla distinct and includes both Canary Island provinces', () => {
  const result = markVisitedRegions(boundaries('Spain'), ['CE', 'Melilla', 'ML', 'Las Palmas', 'Santa Cruz de Tenerife'])
  expect(result.count).toBe(4)
  expect(result.unmatched).toEqual([])
  const data = boundaries('Spain')
  expect(data.features.find(feature => feature.properties.id === 'ES-PM')!.properties.label[0]).toBeGreaterThan(2)
  expect(data.features.find(feature => feature.properties.id === 'ES-GC')!.properties.label[0]).toBeLessThan(-13)
  expect(data.features.find(feature => feature.properties.id === 'ES-TF')!.properties.label[0]).toBeLessThan(-16)
})


it('matches Dominican province aliases and keeps the National District separate', () => {
  expect(resolveMapCountry('República Dominicana')).toBe('Dominican Republic')
  expect(resolveMapCountry('Dominican Republic')).toBe('Dominican Republic')
  const result = markVisitedRegions(boundaries('Dominican Republic'), [
    'Samaná', 'Samana province', 'DO-20', 'Distrito Nacional', 'National District', 'DO-01',
    'Santo Domingo', 'DO-32', 'Elias Pina', 'La Estrelleta', 'Bahoruco', 'Baoruco',
  ])
  expect(result.count).toBe(5)
  expect(result.unmatched).toEqual([])
  expect(result.data.features.filter(feature => feature.properties.visited).map(feature => feature.properties.id).sort())
    .toEqual(['DO-01', 'DO-03', 'DO-07', 'DO-20', 'DO-32'])
  expect(coverageSummary('Dominican Republic', 5)).toBe('5 of 32 provinces / National District visited')
})

it('does not infer Dominican provinces from resort or municipality names', () => {
  const names = ['Punta Cana', 'Higuey', 'Nagua', 'Santo Domingo Este', 'Las Terrenas', 'El Limon']
  const result = markVisitedRegions(boundaries('Dominican Republic'), names)
  expect(result.count).toBe(0)
  expect(result.unmatched).toEqual(names)
})
