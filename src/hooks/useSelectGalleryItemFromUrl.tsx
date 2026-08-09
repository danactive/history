'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

import { getPrimaryFilename } from '../utils'
import type { SelectionCoordinator } from './useSelectionCoordinator'

type SelectableGalleryItem = {
  filename?: string | string[] | null
}

export default function useSelectGalleryItemFromUrl<ItemType extends SelectableGalleryItem>({
  items,
  refImageGallery,
  setMemoryIndex,
  setViewed,
  selectionCoordinator,
  defer = false,
}: {
  items: ItemType[]
  refImageGallery: React.RefObject<{ getCurrentIndex?: () => number; slideToIndex?: (index: number) => void } | null>
  setMemoryIndex: (index: number) => void
  setViewed: (index: number) => void
  selectionCoordinator?: SelectionCoordinator
  defer?: boolean
}) {
  const searchParams = useSearchParams()
  const selectId = searchParams.get('select')

  useEffect(() => {
    if (!selectId || items.length === 0) {
      return
    }

    const nextIndex = items.findIndex((item) => getPrimaryFilename(item.filename) === selectId)
    if (nextIndex < 0) {
      return
    }

    const syncSelection = () => {
      if (!selectionCoordinator && refImageGallery.current?.getCurrentIndex?.() === nextIndex) {
        return
      }

      if (selectionCoordinator) {
        selectionCoordinator.selectIndex(nextIndex, { origin: 'url' })
      } else {
        refImageGallery.current?.slideToIndex?.(nextIndex)
        setMemoryIndex(nextIndex)
        setViewed(nextIndex)
      }
    }

    if (!defer) {
      syncSelection()
      return
    }

    const timeout = setTimeout(syncSelection, 0)
    return () => clearTimeout(timeout)
  }, [defer, items, refImageGallery, selectId, selectionCoordinator, setMemoryIndex, setViewed])
}
