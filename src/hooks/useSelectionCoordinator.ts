'use client'

import { useCallback, useEffect, useMemo, useRef } from 'react'
import type { ImageGalleryRef } from 'react-image-gallery'

import type { Item } from '../types/common'
import { getPrimaryFilename } from '../utils'

export type SelectionOrigin = 'filter' | 'gallery' | 'thumbnail' | 'url'
export type CameraIntent = 'follow' | 'preserve'

export type SelectionSnapshot = {
  item: Item | null;
  index: number;
  revision: number;
  origin: SelectionOrigin;
  cameraIntent: CameraIntent;
}

export type SelectPhotoOptions = {
  origin: SelectionOrigin;
  cameraIntent?: CameraIntent;
  syncGallery?: boolean;
  force?: boolean;
}

export type SelectionCoordinator = {
  getSnapshot: () => SelectionSnapshot;
  subscribe: (listener: (selection: SelectionSnapshot) => void) => () => void;
  selectIndex: (index: number, options: SelectPhotoOptions) => void;
  selectId: (id: string, options: SelectPhotoOptions) => void;
}

type UseSelectionCoordinatorProps = {
  items: Item[];
  refImageGallery: React.RefObject<ImageGalleryRef | null>;
  setMemoryIndex: (index: number) => void;
  setViewed: (index: number) => void;
}

/**
 * The sole owner of photo selection for a page. Subscribers perform their
 * imperative work from one ordered snapshot, while React state remains a
 * projection for the surrounding UI rather than a synchronization mechanism.
 */
export default function useSelectionCoordinator({
  items,
  refImageGallery,
  setMemoryIndex,
  setViewed,
}: UseSelectionCoordinatorProps): SelectionCoordinator {
  const itemsRef = useRef(items)
  const galleryRef = useRef(refImageGallery)
  const setMemoryIndexRef = useRef(setMemoryIndex)
  const setViewedRef = useRef(setViewed)
  const listenersRef = useRef(new Set<(selection: SelectionSnapshot) => void>())
  const initialItem = items[0] ?? null
  const selectionRef = useRef<SelectionSnapshot>({
    item: initialItem,
    index: initialItem ? 0 : -1,
    revision: 0,
    origin: 'filter',
    cameraIntent: 'follow',
  })

  itemsRef.current = items
  galleryRef.current = refImageGallery
  setMemoryIndexRef.current = setMemoryIndex
  setViewedRef.current = setViewed

  const publish = useCallback((selection: SelectionSnapshot) => {
    selectionRef.current = selection
    listenersRef.current.forEach(listener => listener(selection))
  }, [])

  const selectIndex = useCallback((index: number, options: SelectPhotoOptions) => {
    const item = itemsRef.current[index]
    if (!item) return

    const previous = selectionRef.current
    const cameraIntent = options.cameraIntent ?? 'follow'
    const isSameSelection = previous.item?.id === item.id && previous.index === index
    if (isSameSelection && !options.force) return

    const selection: SelectionSnapshot = {
      item,
      index,
      revision: previous.revision + 1,
      origin: options.origin,
      cameraIntent,
    }

    // Notify the map first: it updates one feature and starts the animation
    // before a large gallery transition can occupy the main thread.
    publish(selection)

    if (options.syncGallery !== false && galleryRef.current.current?.getCurrentIndex?.() !== index) {
      galleryRef.current.current?.slideToIndex(index)
    }

    setMemoryIndexRef.current(index)
    setViewedRef.current(index)
  }, [publish])

  const selectId = useCallback((id: string, options: SelectPhotoOptions) => {
    const index = itemsRef.current.findIndex((item) => (
      item.id === id || getPrimaryFilename(item.filename) === id
    ))
    if (index !== -1) selectIndex(index, options)
  }, [selectIndex])

  const subscribe = useCallback((listener: (selection: SelectionSnapshot) => void) => {
    listenersRef.current.add(listener)
    return () => listenersRef.current.delete(listener)
  }, [])

  const getSnapshot = useCallback(() => selectionRef.current, [])

  useEffect(() => {
    const previous = selectionRef.current
    if (items.length === 0) {
      if (previous.item) {
        publish({
          item: null,
          index: -1,
          revision: previous.revision + 1,
          origin: 'filter',
          cameraIntent: 'preserve',
        })
      }
      return
    }

    const retainedIndex = previous.item
      ? items.findIndex(item => item.id === previous.item?.id)
      : -1
    const nextIndex = retainedIndex === -1 ? 0 : retainedIndex
    if (previous.index !== nextIndex || previous.item?.id !== items[nextIndex]?.id) {
      selectIndex(nextIndex, {
        origin: 'filter',
        cameraIntent: 'preserve',
        syncGallery: true,
      })
    }
  }, [items, publish, selectIndex])

  return useMemo(() => ({ getSnapshot, subscribe, selectIndex, selectId }), [getSnapshot, selectId, selectIndex, subscribe])
}
