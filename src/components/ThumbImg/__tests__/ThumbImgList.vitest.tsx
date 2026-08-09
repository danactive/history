import { render } from '@testing-library/react'
import React from 'react'
import { describe, expect, test, vi } from 'vitest'

vi.mock('next/image', () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img {...props} alt={typeof props.alt === 'string' ? props.alt : ''} />
  ),
}))

import { ThumbImgList } from '../index'

describe('ThumbImgList', () => {
  test('renders a bounded thumbnail window when virtualization is enabled', () => {
    const items = Array.from({ length: 500 }, (_, index) => ({ id: String(index) }))
    const { container } = render(
      <ThumbImgList
        items={items}
        getKey={(item) => item.id}
        getThumbProps={(item, index) => ({
          caption: item.id,
          onSelectIndex: vi.fn(),
          selectIndex: index,
          src: `/thumb-${item.id}.jpg`,
          viewed: false,
        })}
        virtualize
      />,
    )

    const renderedItems = container.querySelectorAll('li')
    expect(renderedItems.length).toBeGreaterThan(0)
    expect(renderedItems.length).toBeLessThan(items.length)
  })
})
