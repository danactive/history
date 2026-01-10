import React from 'react'
import { render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

// Mock color-thief-react to synchronously provide a color via render-prop
vi.mock('color-thief-react', () => ({
  default: ({ children }: { children: (arg: { data?: string }) => React.ReactNode }) => (
    <>{children({ data: 'rgba(255, 200, 100, 1)' })}</>
  ),
}))

// Stub next/image SSR to avoid image optimization in tests
vi.mock('next/image', () => ({
  default: (props: Record<string, unknown>) => {
    const imgProps = props as React.ImgHTMLAttributes<HTMLImageElement>
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...imgProps} alt={typeof imgProps.alt === 'string' ? imgProps.alt : ''} />
  },
}))

import type { Item } from '../../../types/common.d'
import type { ClusteredMarkers } from '../../../lib/generate-clusters'
import type { Viewed } from '../../../hooks/useMemory'
import SplitViewer from '../index'

describe('SplitViewer colour-thief background', () => {
  it('applies background style from Color render-prop data', () => {
    const items: Item[] = [
      {
        id: '1',
        caption: 'Test',
        filename: 'test-photo.jpg',
        photoDate: null,
        city: 'Test City',
        location: null,
        description: null,
        search: null,
        persons: null,
        title: 'Test',
        coordinates: null,
        coordinateAccuracy: null,
        thumbPath: '/test/fixtures/resizable/originals/2016-07-12.jpg',
        photoPath: '/test/fixtures/resizable/originals/2016-07-12.jpg',
        mediaPath: '/test/fixtures/resizable/originals/2016-07-12.jpg',
        videoPaths: null,
        reference: null,
      },
    ]

    const clustered: ClusteredMarkers = {
      labels: {},
      itemFrequency: {},
      generatedAt: new Date().toISOString(),
      itemCount: 0,
    }
    const setViewedMock: Viewed = vi.fn()
    const setMemoryIndexMock = vi.fn()
    const onToggleMapFilterMock = vi.fn()
    const onMapBoundsChangeMock = vi.fn()

    const { container } = render(
      <SplitViewer
        clusteredMarkers={clustered}
        items={items}
        refImageGallery={null}
        setViewed={setViewedMock}
        memoryIndex={0}
        setMemoryIndex={setMemoryIndexMock}
        mapFilterEnabled={false}
        onToggleMapFilter={onToggleMapFilterMock}
        onMapBoundsChange={onMapBoundsChangeMock}
      />,
    )

    // Assert a <style> tag was injected with the expected background color
    const styleEl = container.querySelector('style')
    expect(styleEl).toBeTruthy()
    expect(styleEl?.textContent).toContain('background: rgba(255, 200, 100, 1)')
  })
})
