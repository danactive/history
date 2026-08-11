// @vitest-environment node

import { describe, expect, test } from 'vitest'

import { NextRequest } from 'next/server'
import { GET, POST } from '../../app/api/galleries/[gallery]/domains/route'
import config from '../../src/models/config'

describe('Domains endpoint', () => {
  test('* GET returns domain metadata for a gallery', async () => {
    const response = await GET(
      new NextRequest(`http://test/api/galleries/${config.defaultGallery}/domains?view=all`),
      { params: Promise.resolve({ gallery: config.defaultGallery }) },
    )
    const result = await response.json()

    expect(response.status).toBe(200)
    expect(result.gallery).toBe(config.defaultGallery)
    expect(result.view).toBe('all')
    expect(result.counts.scopedItemCount).toBeGreaterThan(0)
    expect(Array.isArray(result.domains.indexedKeywords)).toBe(true)
    expect(Array.isArray(result.domains.locationOptions)).toBe(true)
    expect(Array.isArray(result.domains.personCounts)).toBe(true)
    expect(Array.isArray(result.domains.personOptions)).toBe(true)
    expect(Array.isArray(result.domains.yearOptions)).toBe(true)
    expect(Array.isArray(result.domains.tagOptions)).toBe(true)
  })

  test('* GET requires album when view=album', async () => {
    const response = await GET(
      new NextRequest(`http://test/api/galleries/${config.defaultGallery}/domains?view=album`),
      { params: Promise.resolve({ gallery: config.defaultGallery }) },
    )
    const result = await response.json()

    expect(response.status).toBe(400)
    expect(result.error.message).toContain('album query param is required')
  })

  test('* GET persons includes age summary', async () => {
    const response = await GET(
      new NextRequest(`http://test/api/galleries/${config.defaultGallery}/domains?view=persons`),
      { params: Promise.resolve({ gallery: config.defaultGallery }) },
    )
    const result = await response.json()

    expect(response.status).toBe(200)
    expect(result.view).toBe('persons')
    expect(result.ageSummary).toBeTruthy()
    expect(Array.isArray(result.ageSummary.ages)).toBe(true)
  })

  test('* POST verb is denied', async () => {
    const response = await POST(new NextRequest('http://test', { method: 'POST' }))
    const result = await response.json()

    expect(response.status).toBe(405)
    expect(result.error.message.toLowerCase()).toContain('not allowed')
  })
})
