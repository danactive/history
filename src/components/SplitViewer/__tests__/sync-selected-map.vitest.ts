import { describe, expect, it, vi } from 'vitest'
import type { MapRef } from 'react-map-gl/mapbox'
import type { Item } from '../../../types/common'
import { syncSelectedMap } from '../sync-selected-map'

const item: Item = {
  id: 'photo-1',
  caption: 'Example',
  filename: 'photo-1.jpg',
  photoDate: null,
  city: 'Vancouver, BC',
  location: 'Rogers Arena',
  description: null,
  search: null,
  persons: null,
  title: 'Example',
  coordinates: [-123.108, 49.277],
  coordinateAccuracy: 15,
  thumbPath: '/thumb.jpg',
  photoPath: '/photo.jpg',
  mediaPath: '/photo.jpg',
  videoPaths: null,
  reference: null,
}

describe('syncSelectedMap', () => {
  it('begins an animated flight without rebuilding the clustered source', () => {
    const flyTo = vi.fn()
    const mapRef = { flyTo } as unknown as Pick<MapRef, 'flyTo'>

    const flightKey = syncSelectedMap({
      mapRef,
      item,
      defaultZoom: 10,
      shouldFly: true,
      previousFlightKey: null,
    })

    expect(flyTo).toHaveBeenCalledWith({
      center: item.coordinates,
      zoom: 15,
      essential: true,
    })
    expect(flightKey).toBe('photo-1:-123.108:49.277:15')
  })

  it('preserves a map-filtered viewport', () => {
    const flyTo = vi.fn()
    const mapRef = { flyTo } as unknown as Pick<MapRef, 'flyTo'>

    const flightKey = syncSelectedMap({
      mapRef,
      item,
      defaultZoom: 10,
      shouldFly: false,
      previousFlightKey: null,
    })

    expect(flyTo).not.toHaveBeenCalled()
    expect(flightKey).toBeNull()
  })
})
