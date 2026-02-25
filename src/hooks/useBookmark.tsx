'use client'

import { Button } from '@mui/joy'
import type { RefObject } from 'react'

interface UseBookmarkProps<ItemType> {
  refImageGallery?: RefObject<any>
  displayedItems: ItemType[]
  pathname: string
  currentIndex?: number
}

export default function useBookmark<ItemType>({
  refImageGallery,
  displayedItems,
  pathname,
  currentIndex,
}: UseBookmarkProps<ItemType>) {

  const handleBookmark = async () => {
    // Get current photo ID from displayed items (respects map filter)
    const galleryIndex = refImageGallery?.current?.getCurrentIndex?.()
    const indexToUse = typeof galleryIndex === 'number' ? galleryIndex : (currentIndex ?? 0)
    if (indexToUse < 0 || indexToUse >= displayedItems.length) return
    const currentItem = displayedItems[indexToUse]
    if (!currentItem) return

    // Use filename as unique identifier (works across all albums)
    const identifier = Array.isArray((currentItem as any).filename)
      ? (currentItem as any).filename[0]
      : (currentItem as any).filename
    if (!identifier) return

    const params = new URLSearchParams(window.location.search)
    params.set('select', identifier)
    const queryString = params.toString()
    const bookmarkUrl = `${window.location.origin}${pathname}${queryString ? `?${queryString}` : ''}`

    // Copy bookmark URL to clipboard (may fail in non-secure contexts)
    try {
      await navigator.clipboard.writeText(bookmarkUrl)
    } catch {
      // Fallback for non-HTTPS or when clipboard API is unavailable
      const textarea = document.createElement('textarea')
      textarea.value = bookmarkUrl
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      try {
        document.execCommand('copy')
      } finally {
        document.body.removeChild(textarea)
      }
    }

    // Update URL without triggering navigation (avoids gallery slide + map movement)
    const newUrl = `${pathname}${queryString ? `?${queryString}` : ''}`
    window.history.replaceState(null, '', newUrl)
  }

  const BookmarkButton = () => (
    <Button
      type="button"
      onClick={handleBookmark}
      color="primary"
      variant="soft"
      title="Copy bookmark URL to clipboard"
    >
      Bookmark
    </Button>
  )

  return { BookmarkButton, handleBookmark }
}
