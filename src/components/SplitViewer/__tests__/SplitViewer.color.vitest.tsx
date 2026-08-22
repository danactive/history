import React, { createRef } from 'react'
import { act, fireEvent, render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { ImageGalleryRef } from 'react-image-gallery'

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
import type { SelectionCoordinator } from '../../../hooks/useSelectionCoordinator'
import SplitViewer, { getGalleryWindowStart } from '../index'

function createItem(index: number): Item {
  return {
    id: String(index),
    caption: `Photo ${index}`,
    filename: `photo-${index}.jpg`,
    photoDate: null,
    city: 'Test City',
    location: null,
    description: null,
    search: null,
    persons: null,
    title: `Photo ${index}`,
    coordinates: null,
    coordinateAccuracy: null,
    thumbPath: `/thumb-${index}.jpg`,
    photoPath: `/photo-${index}.jpg`,
    mediaPath: `/photo-${index}.jpg`,
    videoPaths: null,
    reference: null,
  }
}

describe('SplitViewer rendering', () => {
  it('renders an empty result set without repeatedly updating its gallery window', () => {
    const clustered: ClusteredMarkers = {
      labels: {},
      itemFrequency: {},
      generatedAt: new Date().toISOString(),
      itemCount: 0,
    }
    const selectionCoordinator: SelectionCoordinator = {
      getSnapshot: () => ({ item: null, index: -1, revision: 0, origin: 'filter', cameraIntent: 'preserve' }),
      subscribe: () => () => {},
      selectIndex: vi.fn(),
      selectId: vi.fn(),
    }

    const { container, getByRole } = render(
      <SplitViewer
        clusteredMarkers={clustered}
        items={[]}
        refImageGallery={null}
        memoryIndex={0}
        selectionCoordinator={selectionCoordinator}
      />,
    )

    expect(container.querySelector('.image-gallery')).toBeTruthy()
    expect(getByRole('button', { name: 'Hide map' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('lets viewers hide the map and keep the gallery as the presentation surface', () => {
    const item = createItem(0)
    const clustered: ClusteredMarkers = {
      labels: {},
      itemFrequency: {},
      generatedAt: new Date().toISOString(),
      itemCount: 1,
    }
    const selectionCoordinator: SelectionCoordinator = {
      getSnapshot: () => ({ item, index: 0, revision: 0, origin: 'gallery', cameraIntent: 'follow' }),
      subscribe: () => () => {},
      selectIndex: vi.fn(),
      selectId: vi.fn(),
    }

    const { getByRole, container } = render(
      <SplitViewer
        clusteredMarkers={clustered}
        items={[item]}
        refImageGallery={null}
        memoryIndex={0}
        selectionCoordinator={selectionCoordinator}
      />,
    )

    fireEvent.click(getByRole('button', { name: 'Hide map' }))

    expect(getByRole('button', { name: 'Show map' })).toHaveAttribute('aria-pressed', 'false')
    expect(container.querySelector('[class*="mapHidden"]')).toBeTruthy()
  })

  it('renders without injecting a dynamic background style tag', () => {
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
    const onToggleMapFilterMock = vi.fn()
    const onMapBoundsChangeMock = vi.fn()
    const selectionCoordinator: SelectionCoordinator = {
      getSnapshot: () => ({ item: items[0], index: 0, revision: 0, origin: 'filter', cameraIntent: 'follow' }),
      subscribe: () => () => {},
      selectIndex: vi.fn(),
      selectId: vi.fn(),
    }

    const { container } = render(
      <SplitViewer
        clusteredMarkers={clustered}
        items={items}
        refImageGallery={null}
        memoryIndex={0}
        selectionCoordinator={selectionCoordinator}
        mapFilterEnabled={false}
        onToggleMapFilter={onToggleMapFilterMock}
        onMapBoundsChange={onMapBoundsChangeMock}
      />,
    )

    expect(container.querySelector('.image-gallery')).toBeTruthy()
    expect(container.querySelector('style')).toBeNull()
  })

  it('bounds a large gallery while preserving global selection indices', () => {
    const items = Array.from({ length: 100 }, (_, index) => createItem(index))
    const refImageGallery = createRef<ImageGalleryRef>()
    const selectionCoordinator: SelectionCoordinator = {
      getSnapshot: () => ({ item: items[50], index: 50, revision: 0, origin: 'filter', cameraIntent: 'follow' }),
      subscribe: () => () => {},
      selectIndex: vi.fn(),
      selectId: vi.fn(),
    }
    const clustered: ClusteredMarkers = {
      labels: {},
      itemFrequency: {},
      generatedAt: new Date().toISOString(),
      itemCount: items.length,
    }

    const { container } = render(
      <SplitViewer
        clusteredMarkers={clustered}
        items={items}
        refImageGallery={refImageGallery}
        memoryIndex={50}
        selectionCoordinator={selectionCoordinator}
      />,
    )

    expect(getGalleryWindowStart(items.length, 50)).toBe(35)
    expect(container.querySelectorAll('.image-gallery-slide')).toHaveLength(33)

    fireEvent.keyDown(window, { key: 'ArrowRight' })
    expect(selectionCoordinator.selectIndex).toHaveBeenCalledWith(51, {
      origin: 'gallery',
      syncGallery: false,
    })

    act(() => refImageGallery.current?.slideToIndex(90))
    expect(refImageGallery.current?.getCurrentIndex()).toBe(90)
    expect(container.querySelectorAll('.image-gallery-slide').length).toBeLessThanOrEqual(33)
  })

  it('wraps carousel navigation at both ends', () => {
    const items = Array.from({ length: 100 }, (_, index) => createItem(index))
    const selectionCoordinator: SelectionCoordinator = {
      getSnapshot: () => ({ item: items[99], index: 99, revision: 0, origin: 'filter', cameraIntent: 'follow' }),
      subscribe: () => () => {},
      selectIndex: vi.fn(),
      selectId: vi.fn(),
    }
    const clustered: ClusteredMarkers = {
      labels: {},
      itemFrequency: {},
      generatedAt: new Date().toISOString(),
      itemCount: items.length,
    }

    const renderViewer = (memoryIndex: number) => (
      <SplitViewer
        clusteredMarkers={clustered}
        items={items}
        refImageGallery={null}
        memoryIndex={memoryIndex}
        selectionCoordinator={selectionCoordinator}
      />
    )
    const { getByRole, rerender } = render(renderViewer(99))

    fireEvent.click(getByRole('button', { name: 'Next Slide' }))
    rerender(renderViewer(0))
    fireEvent.click(getByRole('button', { name: 'Previous Slide' }))

    expect(selectionCoordinator.selectIndex).toHaveBeenNthCalledWith(1, 0, {
      origin: 'gallery',
      syncGallery: false,
    })
    expect(selectionCoordinator.selectIndex).toHaveBeenNthCalledWith(2, 99, {
      origin: 'gallery',
      syncGallery: false,
    })
  })
})
