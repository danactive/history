'use client'

import { Button } from '@mui/joy'
import type { RefObject } from 'react'

interface UseBookmarkProps<ItemType> {
  refImageGallery?: RefObject<any>
  displayedItems: ItemType[]
  pathname: string
}

export default function useBookmark<ItemType>({
  refImageGallery,
  displayedItems,
  pathname,
}: UseBookmarkProps<ItemType>) {
  const handleBookmark = () => {
    // Get current photo ID from displayed items (respects map filter)
    const currentIndex = refImageGallery?.current?.getCurrentIndex?.() ?? 0
    const currentItem = displayedItems[currentIndex]
    if (!currentItem) return

    // Use filename as unique identifier (works across all albums)
    const identifier = Array.isArray((currentItem as any).filename)
      ? (currentItem as any).filename[0]
      : (currentItem as any).filename
    if (!identifier) return

    // Copy bookmark URL to clipboard
    const bookmarkUrl = `${window.location.origin}${pathname}?select=${identifier}`
    navigator.clipboard.writeText(bookmarkUrl)
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
