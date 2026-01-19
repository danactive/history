'use client'

import { Button } from '@mui/joy'
import { useRouter } from 'next/navigation'
import type { RefObject } from 'react'

interface UseBookmarkProps<ItemType> {
  refImageGallery?: RefObject<any>
  displayedItems: ItemType[]
  pathname: string
  currentIndex?: number
  selectById?: (id: string) => void
}

export default function useBookmark<ItemType>({
  refImageGallery,
  displayedItems,
  pathname,
  currentIndex,
  selectById,
}: UseBookmarkProps<ItemType>) {
  const router = useRouter()

  const handleBookmark = () => {
    // Get current photo ID from displayed items (respects map filter)
    const galleryIndex = refImageGallery?.current?.getCurrentIndex?.()
    const indexToUse = typeof galleryIndex === 'number' ? galleryIndex : (currentIndex ?? 0)
    const currentItem = displayedItems[indexToUse]
    if (!currentItem) return

    // Use filename as unique identifier (works across all albums)
    const identifier = Array.isArray((currentItem as any).filename)
      ? (currentItem as any).filename[0]
      : (currentItem as any).filename
    if (!identifier) return

    // Notify parent to track selection (updates memoryIndex to match ID)
    if (selectById) {
      selectById(identifier)
    }

    // Copy bookmark URL to clipboard
    const bookmarkUrl = `${window.location.origin}${pathname}?select=${identifier}`
    navigator.clipboard.writeText(bookmarkUrl)

    // Update URL to reflect the selection
    router.replace(`${pathname}?select=${identifier}`, { scroll: false })
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
