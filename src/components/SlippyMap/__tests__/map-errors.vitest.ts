import { describe, expect, it } from 'vitest'

import { isTransientMapboxNetworkError } from '../map-errors'

describe('isTransientMapboxNetworkError', () => {
  it('recognizes Firefox Mapbox tile network failures', () => {
    expect(isTransientMapboxNetworkError(new Error(
      'NetworkError when attempting to fetch resource. https://api.mapbox.com/v4/mapbox.satellite/17/26700/43220@2x.webp',
    ))).toBe(true)
  })

  it('recognizes fetch failures when Mapbox reports the URL separately', () => {
    expect(isTransientMapboxNetworkError({
      message: 'Failed to fetch',
      url: 'https://api.mapbox.com/v4/mapbox.satellite/17/26700/43220@2x.webp',
    })).toBe(true)
  })

  it('does not hide authentication or style errors', () => {
    expect(isTransientMapboxNetworkError(new Error(
      'Unauthorized: https://api.mapbox.com/styles/v1/example',
    ))).toBe(false)
    expect(isTransientMapboxNetworkError(new Error('Style is not done loading'))).toBe(false)
  })

  it('does not hide failures from unrelated hosts', () => {
    expect(isTransientMapboxNetworkError(new Error(
      'NetworkError when attempting to fetch resource. https://example.com/tile.webp',
    ))).toBe(false)
  })
})
