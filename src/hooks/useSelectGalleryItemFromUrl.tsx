'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useRef } from 'react'

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
  const appliedSelectIdRef = useRef<string | null>(null)

  useEffect(() => {
    if (!selectId) {
      appliedSelectIdRef.current = null
      return
    }
    if (items.length === 0 || appliedSelectIdRef.current === selectId) {
      return
    }

    const nextIndex = items.findIndex((item) => getPrimaryFilename(item.filename) === selectId)
    if (nextIndex < 0) {
      return
    }

    const syncSelection = () => {
      if (appliedSelectIdRef.current === selectId) {
        return
      }
      appliedSelectIdRef.current = selectId

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
