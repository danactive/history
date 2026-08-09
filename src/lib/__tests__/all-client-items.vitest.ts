import { describe, expect, it } from 'vitest'

import type { ServerSideAllItem } from '../../types/common'
import { compactAllPageItem, expandAllPageItem } from '../all-client-items'

const videoItem: ServerSideAllItem = {
  id: 'video-1',
  filename: '2025-01-02-03.mp4',
  photoDate: '2025-01-02',
  city: 'Vancouver, BC, Canada',
  location: 'Rogers Arena',
  caption: 'Video: Concert',
  description: 'Live performance',
  search: 'music, Canada, 2025',
  persons: null,
  title: 'Rogers Arena (Vancouver, BC, Canada)',
  coordinates: [-123.108, 49.277],
  coordinateAccuracy: 15,
  thumbPath: '/galleries/demo/media/thumbs/2025/2025-01-02-03.jpg',
  photoPath: '/galleries/demo/media/photos/2025/2025-01-02-03.jpg',
  mediaPath: '/galleries/demo/media/videos/2025/2025-01-02-03.mp4',
  videoPaths: ['/galleries/demo/media/videos/2025/2025-01-02-03.mp4'],
  reference: null,
  album: '2025',
  gallery: 'demo',
  corpus: 'Live performance Video: Concert Rogers Arena Vancouver, BC, Canada music, Canada, 2025 2025',
  visitedPlace: { country: 'Canada', region: 'BC' },
}

describe('all page client item transport', () => {
  it('removes deterministic duplicate fields and reconstructs them in the client boundary', () => {
    const compact = compactAllPageItem(videoItem)

    expect(compact).toEqual(expect.objectContaining({ id: videoItem.id, isVideo: true }))
    expect(compact).not.toHaveProperty('corpus')
    expect(compact).not.toHaveProperty('gallery')
    expect(compact).not.toHaveProperty('mediaPath')
    expect(compact).not.toHaveProperty('photoPath')
    expect(compact).not.toHaveProperty('thumbPath')
    expect(compact).not.toHaveProperty('title')
    expect(compact).not.toHaveProperty('videoPaths')

    expect(expandAllPageItem(compact, 'demo')).toEqual(videoItem)
  })
})
