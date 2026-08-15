import {
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type Ref,
} from 'react'
import dynamic from 'next/dynamic'
import ImageGallery, { type GalleryItem, type ImageGalleryProps, type ImageGalleryRef } from 'react-image-gallery'
import 'react-image-gallery/styles/image-gallery.css'
import type { MapRef } from 'react-map-gl/mapbox'
import config from '../../../src/models/config'
import type { SelectionCoordinator, SelectionSnapshot } from '../../hooks/useSelectionCoordinator'
import type { ClusteredMarkers } from '../../lib/generate-clusters'
import type { Bounds } from '../../lib/map-filtering'
import { Item } from '../../types/common'
import { getExt, getPrimaryFilename } from '../../utils'
import AlbumContext from '../Context'
import Video from '../Video'
import { syncSelectedMap } from './sync-selected-map'
import styles from './styles.module.css'

const SlippyMap = dynamic(() => import('../SlippyMap'), {
  ssr: false,
  loading: () => <div className={styles.mapPlaceholder} />,
})

interface ImageGalleryType extends GalleryItem {
  filename: string;
  mediaPath: string;
  caption: string;
}

const MAX_RENDERED_SLIDES = 31
const GALLERY_EDGE_BUFFER = 5
const GALLERY_SLIDE_DURATION = 250

type GalleryWindowState = {
  anchorIndex: number;
  generation: number;
  sourceVersion: number;
  start: number;
}

export function getGalleryWindowStart(
  itemCount: number,
  selectedIndex: number,
  windowSize = MAX_RENDERED_SLIDES,
) {
  if (itemCount <= windowSize) return 0

  const safeSelectedIndex = Math.max(0, Math.min(selectedIndex, itemCount - 1))
  const centeredStart = safeSelectedIndex - Math.floor(windowSize / 2)
  return Math.max(0, Math.min(centeredStart, itemCount - windowSize))
}

const toCarousel = (item: Item) => {
  const imageGallery: ImageGalleryType = {
    caption: item.caption,
    // Provide stable fallbacks so items array length/order does NOT change after first render
    original: item.photoPath || item.thumbPath || item.mediaPath,
    thumbnail: item.thumbPath || item.photoPath || item.mediaPath,
    filename: getPrimaryFilename(item.filename),
    mediaPath: item.mediaPath,
  }
  if (item.description) {
    imageGallery.description = item.description
    imageGallery.caption = item.caption
  }
  const extension = getExt(item.mediaPath)
  const isVideo = extension && config.supportedFileTypes.video.includes(extension) && item.mediaPath
  if (isVideo) {
    const { mediaPath, caption } = imageGallery
    imageGallery.renderItem = (galleryItem) => (
      <Video
        extension={extension}
        src={mediaPath}
        poster={galleryItem.original}
        description={galleryItem.description ?? caption}
      />
    )
  }
  return imageGallery
}

function SplitViewer({
  clusteredMarkers,
  items,
  refImageGallery,
  memoryIndex,
  selectionCoordinator,
  mapFilterEnabled,
  mapBounds,
  isClearing,
  clearCoordinates,
  onToggleMapFilter,
  onMapBoundsChange,
}: {
  clusteredMarkers: ClusteredMarkers;
  items: Item[];
  refImageGallery: Ref<ImageGalleryRef> | null;
  memoryIndex: number;
  selectionCoordinator: SelectionCoordinator;
  mapFilterEnabled?: boolean;
  mapBounds?: Bounds | null;
  isClearing?: boolean;
  clearCoordinates?: [number, number] | null;
  onToggleMapFilter?: () => void;
  onMapBoundsChange?: (bounds: [[number, number],[number, number]]) => void;
}) {
  const meta = useContext(AlbumContext)
  const metaZoom = meta?.geo?.zoom ?? config.defaultZoom
  const refMapBox = useRef<HTMLDivElement>(null)
  const mapRef = useRef<MapRef>(null)
  const localGalleryRef = useRef<ImageGalleryRef>(null)
  const lastMapSelectionRef = useRef<string | null>(null)
  const mapModeRef = useRef({ isClearing, mapFilterEnabled, metaZoom })
  mapModeRef.current = { isClearing, mapFilterEnabled, metaZoom }
  const fullscreenMap = useCallback(() => {
    const div = refMapBox.current
    if (div?.requestFullscreen) {
      div.requestFullscreen()
    } else if (div?.webkitRequestFullscreen) {
      div.webkitRequestFullscreen()
    } else if (div?.msRequestFullscreen) {
      div.msRequestFullscreen()
    } else if (div?.mozRequestFullScreen) {
      div.mozRequestFullScreen()
    } else {
      console.error('Failed to fullscreen')
    }
  }, [])

  const safeIndex = items.length === 0
    ? -1
    : Math.max(0, Math.min(memoryIndex, items.length - 1))

  const galleryItemsRef = useRef(items)
  const gallerySourceVersionRef = useRef(0)
  if (galleryItemsRef.current !== items) {
    galleryItemsRef.current = items
    gallerySourceVersionRef.current += 1
  }
  const gallerySourceVersion = gallerySourceVersionRef.current

  const [galleryWindow, setGalleryWindow] = useState<GalleryWindowState>(() => ({
    anchorIndex: safeIndex,
    generation: 0,
    sourceVersion: gallerySourceVersion,
    start: getGalleryWindowStart(items.length, safeIndex),
  }))

  const activeGalleryWindow = useMemo<GalleryWindowState>(() => {
    const windowEnd = galleryWindow.start + MAX_RENDERED_SLIDES
    const sourceChanged = galleryWindow.sourceVersion !== gallerySourceVersion
    const selectionOutsideWindow = safeIndex < galleryWindow.start || safeIndex >= windowEnd
    if (!sourceChanged && !selectionOutsideWindow) return galleryWindow

    return {
      anchorIndex: safeIndex,
      generation: galleryWindow.generation + 1,
      sourceVersion: gallerySourceVersion,
      start: getGalleryWindowStart(items.length, safeIndex),
    }
  }, [gallerySourceVersion, galleryWindow, items.length, safeIndex])

  useEffect(() => {
    if (activeGalleryWindow !== galleryWindow) {
      setGalleryWindow(activeGalleryWindow)
    }
  }, [activeGalleryWindow, galleryWindow])

  const galleryWindowEnd = Math.min(items.length, activeGalleryWindow.start + MAX_RENDERED_SLIDES)
  const carouselItems = useMemo(
    () => items.slice(activeGalleryWindow.start, galleryWindowEnd).map(toCarousel),
    [activeGalleryWindow.start, galleryWindowEnd, items],
  )
  const localStartIndex = safeIndex < 0
    ? undefined
    : Math.max(0, Math.min(
      activeGalleryWindow.anchorIndex - activeGalleryWindow.start,
      carouselItems.length - 1,
    ))
  const selectedIndexRef = useRef(safeIndex)
  const requestedIndexRef = useRef<number | null>(null)
  const isWrappingCarouselRef = useRef(false)
  if (requestedIndexRef.current === null) {
    selectedIndexRef.current = safeIndex
  } else if (requestedIndexRef.current === safeIndex) {
    requestedIndexRef.current = null
    selectedIndexRef.current = safeIndex
  } else if (requestedIndexRef.current >= items.length) {
    requestedIndexRef.current = null
    selectedIndexRef.current = safeIndex
  }

  const showGlobalIndex = useCallback((index: number) => {
    if (items.length === 0) return

    const nextIndex = Math.max(0, Math.min(index, items.length - 1))
    requestedIndexRef.current = nextIndex
    selectedIndexRef.current = nextIndex
    setGalleryWindow((previousWindow) => ({
      anchorIndex: nextIndex,
      generation: previousWindow.generation + 1,
      sourceVersion: gallerySourceVersionRef.current,
      start: getGalleryWindowStart(items.length, nextIndex),
    }))
  }, [items.length])

  const selectGlobalGalleryIndex = useCallback((index: number) => {
    if (items.length === 0) return

    const nextIndex = (index + items.length) % items.length
    showGlobalIndex(nextIndex)
    selectionCoordinator.selectIndex(nextIndex, {
      origin: 'gallery',
      syncGallery: false,
    })
  }, [items.length, selectionCoordinator, showGlobalIndex])

  const navigateCarousel = useCallback((direction: -1 | 1) => {
    if (items.length < 2) return

    const nextIndex = (selectedIndexRef.current + direction + items.length) % items.length
    const localIndex = nextIndex - activeGalleryWindow.start

    if (localIndex >= 0 && localIndex < carouselItems.length) {
      localGalleryRef.current?.slideToIndex(localIndex)
      return
    }

    selectGlobalGalleryIndex(nextIndex)
  }, [activeGalleryWindow.start, carouselItems.length, items.length, selectGlobalGalleryIndex])

  useImperativeHandle(refImageGallery, () => ({
    play: () => localGalleryRef.current?.play(),
    pause: () => localGalleryRef.current?.pause(),
    togglePlay: () => localGalleryRef.current?.togglePlay(),
    fullScreen: () => localGalleryRef.current?.fullScreen(),
    exitFullScreen: () => localGalleryRef.current?.exitFullScreen(),
    toggleFullScreen: () => localGalleryRef.current?.toggleFullScreen(),
    slideToIndex: showGlobalIndex,
    getCurrentIndex: () => selectedIndexRef.current,
  }), [refImageGallery, showGlobalIndex])

  // Dynamic centroid (always reflects current selected item)
  const dynamicCentroid = (safeIndex === -1 || items.length === 0) ? null : items[safeIndex]

  // Locked centroid used while map filter is ON or during clear
  const [lockedCentroid, setLockedCentroid] = useState<typeof dynamicCentroid>(dynamicCentroid)

  // Lock centroid when clear starts with preserved coordinates
  useEffect(() => {
    if (isClearing && clearCoordinates && dynamicCentroid) {
      setLockedCentroid({
        ...dynamicCentroid,
        coordinates: clearCoordinates,
      } as Item)
    }
  }, [isClearing, clearCoordinates, dynamicCentroid])

  // Update locked centroid during normal navigation only
  useEffect(() => {
    if (!mapFilterEnabled && !isClearing && dynamicCentroid) {
      setLockedCentroid(dynamicCentroid)
    }
  }, [mapFilterEnabled, isClearing, dynamicCentroid])

  // Filtering owns the camera bounds, but not the selected marker: it must
  // continue to identify the photo currently displayed in the gallery. Only
  // the short clear transition holds the previous position in place.
  const effectiveCentroid = isClearing ? lockedCentroid : dynamicCentroid

  const syncMapToSelection = useCallback((selection: SelectionSnapshot) => {
    const currentMap = mapRef.current
    if (!currentMap) return
    const mode = mapModeRef.current
    if (mode.isClearing) {
      lastMapSelectionRef.current = null
      return
    }

    lastMapSelectionRef.current = syncSelectedMap({
      mapRef: currentMap,
      item: selection.item,
      defaultZoom: mode.metaZoom,
      shouldFly: selection.cameraIntent === 'follow' && !mode.mapFilterEnabled,
      previousFlightKey: lastMapSelectionRef.current,
    })
  }, [])

  useEffect(() => selectionCoordinator.subscribe(syncMapToSelection), [selectionCoordinator, syncMapToSelection])

  // The gallery asks its owning state to select a photo. Keeping that state as
  // the source of truth prevents filters from desynchronizing photo and map.
  const handleBeforeSlide: ImageGalleryProps['onBeforeSlide'] = (nextIdxRaw) => {
    if (carouselItems.length === 0) return
    let nextIdx = nextIdxRaw
    if (nextIdx < 0 || nextIdx >= carouselItems.length) {
      nextIdx = Math.max(0, Math.min(nextIdx, carouselItems.length - 1))
    }
    const currentIndex = selectedIndexRef.current
    const currentLocalIndex = currentIndex - activeGalleryWindow.start
    const lastLocalIndex = carouselItems.length - 1
    const wrappedForward = currentLocalIndex === lastLocalIndex && nextIdx === 0
    const wrappedBackward = currentLocalIndex === 0 && nextIdx === lastLocalIndex
    const globalIndex = wrappedForward
      ? (currentIndex + 1) % items.length
      : wrappedBackward
        ? (currentIndex - 1 + items.length) % items.length
        : activeGalleryWindow.start + nextIdx

    if (wrappedForward || wrappedBackward) {
      isWrappingCarouselRef.current = true
      selectGlobalGalleryIndex(globalIndex)
      return
    }

    selectedIndexRef.current = globalIndex
    selectionCoordinator.selectIndex(globalIndex, {
      origin: 'gallery',
      syncGallery: false,
    })
  }

  const handleSlide: ImageGalleryProps['onSlide'] = (localIndex) => {
    if (isWrappingCarouselRef.current) {
      isWrappingCarouselRef.current = false
      return
    }

    const globalIndex = activeGalleryWindow.start + localIndex
    const closeToStart = localIndex < GALLERY_EDGE_BUFFER && globalIndex > 0
    const closeToEnd = localIndex >= carouselItems.length - GALLERY_EDGE_BUFFER
      && globalIndex < items.length - 1
    if (!closeToStart && !closeToEnd) return

    setGalleryWindow((previousWindow) => {
      const nextStart = getGalleryWindowStart(items.length, globalIndex)
      if (previousWindow.start === nextStart) return previousWindow

      return {
        anchorIndex: globalIndex,
        generation: previousWindow.generation + 1,
        sourceVersion: gallerySourceVersionRef.current,
        start: nextStart,
      }
    })
  }

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return

      const target = event.target
      if (target instanceof HTMLElement && (
        target.isContentEditable
        || target instanceof HTMLInputElement
        || target instanceof HTMLTextAreaElement
        || target instanceof HTMLSelectElement
        || target.closest('.mapboxgl-map') !== null
      )) return
      if (items.length < 2) return

      event.preventDefault()
      const direction = event.key === 'ArrowRight' ? 1 : -1
      const currentIndex = selectedIndexRef.current
      const nextIndex = (currentIndex + direction + items.length) % items.length
      const localIndex = nextIndex - activeGalleryWindow.start

      if (localIndex >= 0 && localIndex < carouselItems.length) {
        localGalleryRef.current?.slideToIndex(localIndex)
      } else {
        selectionCoordinator.selectIndex(nextIndex, { origin: 'gallery' })
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeGalleryWindow.start, carouselItems.length, items.length, selectionCoordinator])

  const handleMapReady = useCallback(() => {
    syncMapToSelection(selectionCoordinator.getSnapshot())
  }, [selectionCoordinator, syncMapToSelection])

  return (
    <>
      <section className={styles.split}>
        <section className={styles.left} key="splitLeft">
          <ImageGallery
            key={`${activeGalleryWindow.sourceVersion}:${activeGalleryWindow.generation}`}
            ref={localGalleryRef}
            onBeforeSlide={handleBeforeSlide}
            onSlide={handleSlide}
            startIndex={localStartIndex}
            items={carouselItems}
            disableKeyDown
            infinite
            renderLeftNav={(_, disabled) => (
              <button
                aria-label="Previous Slide"
                className="image-gallery-icon image-gallery-left-nav"
                disabled={disabled || items.length < 2}
                type="button"
                onClick={() => navigateCarousel(-1)}
              >
                <svg className="image-gallery-svg" fill="none" stroke="currentColor" strokeLinecap="square" strokeLinejoin="miter" strokeWidth="1" viewBox="6 0 12 24">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
            )}
            renderRightNav={(_, disabled) => (
              <button
                aria-label="Next Slide"
                className="image-gallery-icon image-gallery-right-nav"
                disabled={disabled || items.length < 2}
                type="button"
                onClick={() => navigateCarousel(1)}
              >
                <svg className="image-gallery-svg" fill="none" stroke="currentColor" strokeLinecap="square" strokeLinejoin="miter" strokeWidth="1" viewBox="6 0 12 24">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            )}
            showPlayButton={false}
            showThumbnails={false}
            slideDuration={GALLERY_SLIDE_DURATION}
            useWindowKeyDown={false}
            lazyLoad
          />
        </section>
        <section className={styles.right} key="splitRight" ref={refMapBox}>
          <SlippyMap
            mapRef={mapRef}
            clusteredMarkers={clusteredMarkers}
            items={items}
            centroid={effectiveCentroid}
            onMapReady={handleMapReady}
            mapFilterEnabled={mapFilterEnabled}
            filterBounds={mapBounds}
            onToggleMapFilter={onToggleMapFilter}
            onBoundsChange={onMapBoundsChange}
          />
          <button type="button" onClick={fullscreenMap}>Full Map</button>
        </section>
      </section>
    </>
  )
}

export default SplitViewer
