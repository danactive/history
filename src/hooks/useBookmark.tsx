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

    const photoId = (currentItem as any).id || (currentItem as any).name
    if (!photoId) return

    // Copy bookmark URL to clipboard
    const bookmarkUrl = `${window.location.origin}${pathname}?select=${photoId}`
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
