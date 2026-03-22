import React from 'react'
import { render, fireEvent, waitFor } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'

import useBookmark from '../useBookmark'

describe('useBookmark', () => {
  const displayedItems = [
    { filename: 'IMG_001.jpg', corpus: 'photo 1' },
    { filename: 'IMG_002.jpg', corpus: 'photo 2' },
    { filename: ['IMG_003a.jpg', 'IMG_003b.jpg'], corpus: 'photo 3 burst' },
  ]

  const pathname = '/gallery/vacation-2024'

  let mockWriteText: ReturnType<typeof vi.fn>
  let mockReplaceState: ReturnType<typeof vi.fn>
  let mockExecCommand: ReturnType<typeof vi.fn>

  beforeEach(() => {
    mockWriteText = vi.fn().mockResolvedValue(undefined)
    mockReplaceState = vi.fn()
    mockExecCommand = vi.fn().mockReturnValue(true)

    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: mockWriteText },
      writable: true,
      configurable: true,
    })

    Object.defineProperty(window, 'location', {
      value: {
        origin: 'https://example.com',
        search: '',
      },
      writable: true,
      configurable: true,
    })

    Object.defineProperty(window, 'history', {
      value: {
        replaceState: mockReplaceState,
        pushState: vi.fn(),
        go: vi.fn(),
        back: vi.fn(),
        forward: vi.fn(),
        length: 1,
        state: null,
      },
      writable: true,
      configurable: true,
    })

    Object.defineProperty(document, 'execCommand', {
      value: mockExecCommand,
      writable: true,
      configurable: true,
    })
  })

  it('renders BookmarkButton', () => {
    const ref = React.createRef<any>()
    ref.current = { getCurrentIndex: () => 0 }

    function TestComponent() {
      const { BookmarkButton } = useBookmark({
        refImageGallery: ref,
        displayedItems,
        pathname,
      })
      return <BookmarkButton />
    }

    const { container } = render(<TestComponent />)
    const button = container.querySelector('button[title="Copy bookmark URL to clipboard"]')
    expect(button).toBeInTheDocument()
    expect(button).toHaveTextContent('Bookmark')
  })

  it('copies bookmark URL to clipboard and updates history on click', async () => {
    const ref = React.createRef<any>()
    ref.current = { getCurrentIndex: () => 1 }

    function TestComponent() {
      const { BookmarkButton } = useBookmark({
        refImageGallery: ref,
        displayedItems,
        pathname,
      })
      return <BookmarkButton />
    }

    const { container } = render(<TestComponent />)
    const button = container.querySelector('button[title="Copy bookmark URL to clipboard"]')!
    fireEvent.click(button)

    await waitFor(() => {
      expect(mockWriteText).toHaveBeenCalledWith(
        'https://example.com/gallery/vacation-2024?select=IMG_002.jpg',
      )
    })

    expect(mockReplaceState).toHaveBeenCalledWith(null, '', '/gallery/vacation-2024?select=IMG_002.jpg')
  })

  it('uses gallery index from ref when available', async () => {
    const ref = React.createRef<any>()
    ref.current = { getCurrentIndex: () => 2 }

    function TestComponent() {
      const { BookmarkButton } = useBookmark({
        refImageGallery: ref,
        displayedItems,
        pathname,
        currentIndex: 0,
      })
      return <BookmarkButton />
    }

    const { container } = render(<TestComponent />)
    fireEvent.click(container.querySelector('button')!)

    await waitFor(() => {
      expect(mockWriteText).toHaveBeenCalledWith(
        expect.stringContaining('select=IMG_003a.jpg'),
      )
    })
  })

  it('falls back to currentIndex when gallery returns undefined', async () => {
    const ref = React.createRef<any>()
    ref.current = { getCurrentIndex: () => undefined }

    function TestComponent() {
      const { BookmarkButton } = useBookmark({
        refImageGallery: ref,
        displayedItems,
        pathname,
        currentIndex: 1,
      })
      return <BookmarkButton />
    }

    const { container } = render(<TestComponent />)
    fireEvent.click(container.querySelector('button')!)

    await waitFor(() => {
      expect(mockWriteText).toHaveBeenCalledWith(
        expect.stringContaining('select=IMG_002.jpg'),
      )
    })
  })

  it('falls back to 0 when both gallery and currentIndex are unavailable', async () => {
    const ref = React.createRef<any>()
    ref.current = { getCurrentIndex: () => undefined }

    function TestComponent() {
      const { BookmarkButton } = useBookmark({
        refImageGallery: ref,
        displayedItems,
        pathname,
      })
      return <BookmarkButton />
    }

    const { container } = render(<TestComponent />)
    fireEvent.click(container.querySelector('button')!)

    await waitFor(() => {
      expect(mockWriteText).toHaveBeenCalledWith(
        expect.stringContaining('select=IMG_001.jpg'),
      )
    })
  })

  it('handles filename as array (uses first element)', async () => {
    const ref = React.createRef<any>()
    ref.current = { getCurrentIndex: () => 2 }

    function TestComponent() {
      const { BookmarkButton } = useBookmark({
        refImageGallery: ref,
        displayedItems,
        pathname,
      })
      return <BookmarkButton />
    }

    const { container } = render(<TestComponent />)
    fireEvent.click(container.querySelector('button')!)

    await waitFor(() => {
      expect(mockWriteText).toHaveBeenCalledWith(
        'https://example.com/gallery/vacation-2024?select=IMG_003a.jpg',
      )
    })
  })

  it('does nothing when index is out of bounds', async () => {
    const ref = React.createRef<any>()
    ref.current = { getCurrentIndex: () => 99 }

    function TestComponent() {
      const { BookmarkButton } = useBookmark({
        refImageGallery: ref,
        displayedItems,
        pathname,
      })
      return <BookmarkButton />
    }

    const { container } = render(<TestComponent />)
    fireEvent.click(container.querySelector('button')!)

    await waitFor(() => {})
    expect(mockWriteText).not.toHaveBeenCalled()
    expect(mockReplaceState).not.toHaveBeenCalled()
  })

  it('preserves existing query params when updating URL', async () => {
    Object.defineProperty(window, 'location', {
      value: { origin: 'https://example.com', search: '?keyword=beach' },
      writable: true,
      configurable: true,
    })

    const ref = React.createRef<any>()
    ref.current = { getCurrentIndex: () => 0 }

    function TestComponent() {
      const { BookmarkButton } = useBookmark({
        refImageGallery: ref,
        displayedItems,
        pathname,
      })
      return <BookmarkButton />
    }

    const { container } = render(<TestComponent />)
    fireEvent.click(container.querySelector('button')!)

    await waitFor(() => {
      expect(mockReplaceState).toHaveBeenCalledWith(
        null,
        '',
        '/gallery/vacation-2024?keyword=beach&select=IMG_001.jpg',
      )
    })
  })

  it('includes keyword in copied bookmark URL', async () => {
    Object.defineProperty(window, 'location', {
      value: { origin: 'https://example.com', search: '?keyword=beach' },
      writable: true,
      configurable: true,
    })

    const ref = React.createRef<any>()
    ref.current = { getCurrentIndex: () => 0 }

    function TestComponent() {
      const { BookmarkButton } = useBookmark({
        refImageGallery: ref,
        displayedItems,
        pathname,
      })
      return <BookmarkButton />
    }

    const { container } = render(<TestComponent />)
    fireEvent.click(container.querySelector('button')!)

    await waitFor(() => {
      expect(mockWriteText).toHaveBeenCalledWith(
        'https://example.com/gallery/vacation-2024?keyword=beach&select=IMG_001.jpg',
      )
    })
  })

  it('uses execCommand fallback when clipboard API fails', async () => {
    mockWriteText.mockRejectedValueOnce(new Error('Clipboard denied'))

    const ref = React.createRef<any>()
    ref.current = { getCurrentIndex: () => 0 }

    function TestComponent() {
      const { BookmarkButton } = useBookmark({
        refImageGallery: ref,
        displayedItems,
        pathname,
      })
      return <BookmarkButton />
    }

    const { container } = render(<TestComponent />)
    fireEvent.click(container.querySelector('button')!)

    await waitFor(() => {
      expect(mockExecCommand).toHaveBeenCalledWith('copy')
    })

    expect(mockReplaceState).toHaveBeenCalled()
  })

  it('works without refImageGallery (uses currentIndex)', async () => {
    function TestComponent() {
      const { BookmarkButton } = useBookmark({
        displayedItems,
        pathname,
        currentIndex: 1,
      })
      return <BookmarkButton />
    }

    const { container } = render(<TestComponent />)
    fireEvent.click(container.querySelector('button')!)

    await waitFor(() => {
      expect(mockWriteText).toHaveBeenCalledWith(
        expect.stringContaining('select=IMG_002.jpg'),
      )
    })
  })
})
