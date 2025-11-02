import Color from 'color-thief-react'
import {
  useContext, useRef, type Ref, type ReactNode, useMemo, useEffect, useState,
} from 'react'
import ImageGallery, { type ReactImageGalleryItem, type ReactImageGalleryProps } from 'react-image-gallery'
import 'react-image-gallery/styles/css/image-gallery.css'
import type { MapRef } from 'react-map-gl/mapbox'

import config from '../../../src/models/config'
import { Viewed } from '../../hooks/useMemory'
import { Item } from '../../types/common'
import { getExt } from '../../utils'
import AlbumContext from '../Context'
import SlippyMap from '../SlippyMap'
import { validatePoint } from '../SlippyMap/options'
import Video from '../Video'
import styles from './styles.module.css'

interface ImageGalleryType extends ReactImageGalleryItem {
  filename: string;
  mediaPath: string;
  caption: string;
  renderItem?(item: ReactImageGalleryItem & { caption: string; mediaPath: string; }): ReactNode;
}

const toCarousel = (item: Item) => {
  const imageGallery: ImageGalleryType = {
    caption: item.caption,
    // Provide stable fallbacks so items array length/order does NOT change after first render
    original: item.photoPath || item.thumbPath || item.mediaPath,
    thumbnail: item.thumbPath || item.photoPath || item.mediaPath,
    filename: Array.isArray(item.filename) ? item.filename[0] : item.filename,
    mediaPath: item.mediaPath,
  }
  if (item.description) {
    imageGallery.description = item.description
    imageGallery.caption = item.caption
  }
  const extension = getExt(item.mediaPath)
  const isVideo = extension && config.supportedFileTypes.video.includes(extension) && item.mediaPath
  if (isVideo) {
    imageGallery.renderItem = ({
      original, mediaPath, description, caption,
    }) => (
      <Video
        extension={extension}
        src={mediaPath}
        poster={original}
        description={description ?? caption}
      />
    )
  }
  return imageGallery
}

function SplitViewer({
  items,
  refImageGallery,
  setViewed,
  memoryIndex,
  setMemoryIndex,
  mapFilterEnabled,
  onToggleMapFilter,
  onMapBoundsChange,
}: {
  items: Item[];
  refImageGallery: Ref<ImageGallery> | null;
  setViewed: Viewed;
  memoryIndex: number;
  setMemoryIndex: (n: number) => void;
  mapFilterEnabled?: boolean;
  onToggleMapFilter?: () => void;
  onMapBoundsChange?: (bounds: [[number, number],[number, number]]) => void;
}) {
  const meta = useContext(AlbumContext)
  const metaZoom = meta?.geo?.zoom ?? config.defaultZoom
  const refMapBox = useRef<HTMLDivElement>(null)
  const mapRef = useRef<MapRef>(null)

  // Build carousel items
  const carouselItems = useMemo(
    () => items.map(toCarousel),
    [items],
  )

  const safeIndex = carouselItems.length === 0
    ? 0
    : (memoryIndex >= carouselItems.length ? carouselItems.length - 1 : memoryIndex)

  // Dynamic centroid (always reflects current selected item)
  const dynamicCentroid = items[safeIndex] || items[0] || null

  // Locked centroid used while map filter is ON (prevents panning / zooming with next/prev)
  const [lockedCentroid, setLockedCentroid] = useState<typeof dynamicCentroid>(dynamicCentroid)

  // Update the locked centroid only when map filter is OFF (so user navigation recenters map)
  useEffect(() => {
    if (!mapFilterEnabled) {
      setLockedCentroid(dynamicCentroid)
    }
  }, [mapFilterEnabled, dynamicCentroid])

  // Only pass startIndex on first mount; afterward let the gallery manage its own state
  const initialIndexRef = useRef(safeIndex)
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  const startIndexProp = mounted ? undefined : initialIndexRef.current

  // Background thumbnail (may be undefined initially)
  const bgThumb = carouselItems[safeIndex]?.thumbnail

  // Slide handler with bounds + map flight (only when map filter OFF)
  const handleBeforeSlide: ReactImageGalleryProps['onBeforeSlide'] = (nextIdxRaw) => {
    if (carouselItems.length === 0) return
    let nextIdx = nextIdxRaw
    if (nextIdx < 0 || nextIdx >= carouselItems.length) {
      nextIdx = Math.max(0, Math.min(nextIdx, carouselItems.length - 1))
    }
    const item = items[nextIdx]
    if (!item) return
    if (nextIdx !== memoryIndex) {
      setMemoryIndex(nextIdx)
      setViewed(nextIdx)
    }
    const { isInvalidPoint, latitude, longitude } = validatePoint(item.coordinates)
    if (!mapFilterEnabled && mapRef.current && !isInvalidPoint) {
      const zoom = item.coordinateAccuracy ?? metaZoom
      mapRef.current.flyTo({ center: [longitude, latitude], zoom })
    }
  }

  const fullscreenMap = async () => {
    const div = refMapBox.current
    if (!div) return
    try {
      const req =
        (div as any).requestFullscreen?.()
        || (div as any).webkitRequestFullscreen?.()
        || (div as any).msRequestFullscreen?.()
        || (div as any).mozRequestFullScreen?.()
      if (req && typeof (req as Promise<unknown>).then === 'function') {
        await req
      }
    } catch (err) {

      console.warn('Fullscreen request denied', err)
    }
  }

  return (
    <>
      {bgThumb ? (
        <Color src={`/_next/image?url=${encodeURIComponent(bgThumb)}&w=384&q=75`} format="rgbString">
          {({ data: colour }: { data?: string }) => (
            // Removed unused eslint disable for missing rule react/no-danger
            <style>{`.image-gallery, .image-gallery-content.fullscreen, .image-gallery-background { background: ${colour}; }`}</style>
          )}
        </Color>
      ) : null}
      <section className={`${styles.split} image-gallery-background`}>
        <section className={styles.left} key="splitLeft">
          <ImageGallery
            ref={refImageGallery}
            onBeforeSlide={handleBeforeSlide}
            startIndex={startIndexProp}
            items={carouselItems}
            showPlayButton={false}
            showThumbnails={false}
            slideDuration={550}
            useWindowKeyDown={false}
            lazyLoad
          />
        </section>
        <section className={styles.right} key="splitRight" ref={refMapBox}>
          <SlippyMap
            mapRef={mapRef}
            items={items}
            // If filter ON: keep using locked centroid (no pan). If OFF: follow selection.
            centroid={mapFilterEnabled ? lockedCentroid : dynamicCentroid}
            mapFilterEnabled={mapFilterEnabled}
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
