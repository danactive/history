import { describe, expect, test } from 'vitest'

import { getThumbnailCrop } from '../thumbnail-crop'

describe('getThumbnailCrop', () => {
  test('centres the widest possible crop at the target aspect ratio', () => {
    const crop = getThumbnailCrop({
      sourceWidth: 1000,
      sourceHeight: 1000,
      targetWidth: 185,
      targetHeight: 45,
      zoom: 1,
      positionX: 0.5,
      positionY: 0.5,
    })

    expect(crop).toEqual({ left: 0, top: 378, width: 1000, height: 243 })
  })

  test('zooms and pans within the source image bounds', () => {
    const crop = getThumbnailCrop({
      sourceWidth: 1000,
      sourceHeight: 1000,
      targetWidth: 185,
      targetHeight: 45,
      zoom: 2,
      positionX: 1,
      positionY: 0,
    })

    expect(crop).toEqual({ left: 500, top: 0, width: 500, height: 122 })
  })
})
