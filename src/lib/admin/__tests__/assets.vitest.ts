import { describe, expect, test } from 'vitest'

import type { ServerSideAllItem } from '../../../types/common'
import { buildAssetVariants } from '../assets'

function makeItem(isVideo = false): ServerSideAllItem {
  return {
    id: 'one',
    filename: isVideo ? '2024-01-02-03.mp4' : '2024-01-02-03.jpg',
    photoDate: '2024-01-02',
    city: 'Vancouver',
    location: null,
    caption: 'Test asset',
    description: null,
    search: null,
    persons: null,
    title: 'Vancouver',
    coordinates: null,
    coordinateAccuracy: 0,
    thumbPath: '/galleries/demo/media/thumbs/2024/2024-01-02-03.jpg',
    photoPath: '/galleries/demo/media/photos/2024/2024-01-02-03.jpg',
    mediaPath: isVideo
      ? '/galleries/demo/media/videos/2024/2024-01-02-03.mp4'
      : '/galleries/demo/media/photos/2024/2024-01-02-03.jpg',
    videoPaths: ['/galleries/demo/media/videos/2024/2024-01-02-03.mp4'],
    reference: null,
    gallery: 'demo',
    corpus: 'Test asset',
    visitedPlace: null,
  }
}

describe('buildAssetVariants', () => {
  test('keeps the three raster assets in their canonical order', () => {
    expect(buildAssetVariants(makeItem()).map(asset => asset.kind)).toEqual([
      'original', 'photo', 'thumb',
    ])
  })

  test('places video last after the three raster assets', () => {
    const assets = buildAssetVariants(makeItem(true))

    expect(assets.map(asset => asset.kind)).toEqual([
      'original', 'photo', 'thumb', 'video',
    ])
    expect(assets[3]?.src).toBe('/galleries/demo/media/videos/2024/2024-01-02-03.mp4')
  })
})
