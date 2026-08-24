import React from 'react'
import { render } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { DraggableProvided } from '@hello-pangea/dnd'

vi.mock('next/image', () => ({
  default: (props: Record<string, unknown>) => {
    const imgProps = props as React.ImgHTMLAttributes<HTMLImageElement>
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...imgProps} alt={typeof imgProps.alt === 'string' ? imgProps.alt : ''} />
  },
}))

vi.mock('swr', () => ({
  default: vi.fn(),
}))

import useSWR from 'swr'

import type { Filesystem } from '../../../models/filesystems'
import PreviewImage from '../PreviewImage'

const provided = {
  draggableProps: { style: {} },
  dragHandleProps: {},
  innerRef: vi.fn(),
} as unknown as DraggableProvided

const item: Filesystem = {
  absolutePath: '/galleries/demo/media/photos/2020/example.jpg',
  ext: 'jpg',
  filename: 'example.jpg',
  id: '/galleries/demo/media/photos/2020/example.jpg',
  label: 'example.jpg',
  mediumType: 'image',
  name: 'example',
  path: '/galleries/demo/media/photos/2020/example.jpg',
}

afterEach(() => {
  vi.clearAllMocks()
})

describe('PreviewImage', () => {
  it('explains score reweighting when learned scores are unavailable', () => {
    vi.mocked(useSWR).mockReturnValue({
      data: {
        overall_score: 100,
        technical_score: 10,
        composition_score: null,
        aesthetic_score: 8,
        sharpness_score: 10,
        exposure_score: 10,
        resolution_score: 10,
        image_width: 100,
        image_height: 100,
        notes: [],
      },
      error: undefined,
      isLoading: false,
    } as ReturnType<typeof useSWR>)

    const { container } = render(
      <PreviewImage
        index={0}
        isDragging={false}
        item={item}
        provided={provided}
      />,
    )

    expect(container.firstElementChild).toHaveAttribute(
      'title',
      expect.stringContaining(
        'Overall = technical quality (61.5%) + visual aesthetic (38.5%); composition unavailable, so the available characteristics are reweighted.',
      ),
    )
  })
})
