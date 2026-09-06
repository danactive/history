import { describe, expect, test } from 'vitest'

import { getVideoPaths, originalPath, photoPath, thumbPath } from '../paths'

describe('media paths', () => {
  test('uses the legacy false directory for undated nested media', () => {
    const filename = 'art/example.jpg'

    expect(thumbPath(filename, 'demo')).toBe('/galleries/demo/media/thumbs/false/art/example.jpg')
    expect(photoPath(filename, 'demo')).toBe('/galleries/demo/media/photos/false/art/example.jpg')
    expect(originalPath(filename, 'demo')).toBe('/galleries/demo/media/originals/false/art/example.jpg')
  })

  test('normalizes dated raster derivatives and preserves every video filename', () => {
    expect(originalPath('2024-07-12-lake.heic', 'demo')).toBe(
      '/galleries/demo/media/originals/2024/2024-07-12-lake.jpg',
    )
    expect(photoPath('2024-07-12-lake.heic', 'demo')).toBe(
      '/galleries/demo/media/photos/2024/2024-07-12-lake.jpg',
    )
    expect(thumbPath('2024-07-12-lake.heic', 'demo')).toBe(
      '/galleries/demo/media/thumbs/2024/2024-07-12-lake.jpg',
    )
    expect(getVideoPaths(['2024-07-12-walk.mov', '2025-08-13-clip.mp4'], 'demo')).toEqual([
      '/galleries/demo/media/videos/2024/2024-07-12-walk.mov',
      '/galleries/demo/media/videos/2025/2025-08-13-clip.mp4',
    ])
  })
})
