import { fireEvent, render, screen } from '@testing-library/react'
import React, { createRef } from 'react'
import type { ImageGalleryRef } from 'react-image-gallery'
import { describe, expect, it, vi } from 'vitest'

vi.mock('next/image', () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img {...props} alt={typeof props.alt === 'string' ? props.alt : ''} />
  ),
}))

import type { ServerSideAllItem } from '../../../types/common'
import AllItems from '../Items'

function createItem({ caption, filename }: Pick<ServerSideAllItem, 'caption' | 'filename'>): ServerSideAllItem {
  return {
    id: 'duplicate-album-local-id',
    filename,
    photoDate: null,
    city: 'Test City',
    location: null,
    caption,
    description: null,
    search: null,
    persons: null,
    title: 'Test City',
    coordinates: null,
    coordinateAccuracy: 0,
    thumbPath: `/thumbs/${filename}`,
    photoPath: `/photos/${filename}`,
    mediaPath: `/photos/${filename}`,
    videoPaths: null,
    reference: null,
    corpus: caption,
    gallery: 'demo',
    visitedPlace: null,
  }
}

describe('All items thumbnail selection', () => {
  it('uses the filename when album-local IDs are duplicated', () => {
    const onSelectId = vi.fn()
    const items = [
      createItem({ caption: 'First matching ID', filename: 'first.jpg' }),
      createItem({ caption: 'Second matching ID', filename: 'second.jpg' }),
    ]

    render(
      <AllItems
        items={items}
        refImageGallery={createRef<ImageGalleryRef>()}
        viewedList={new Set()}
        onSelectId={onSelectId}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Second matching ID' }))

    expect(onSelectId).toHaveBeenCalledWith('second.jpg')
  })
})
