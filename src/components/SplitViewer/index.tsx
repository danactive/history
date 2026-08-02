import {
  useCallback,
  useContext,
  useEffect,
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
import { Viewed } from '../../hooks/useMemory'
import type { ClusteredMarkers } from '../../lib/generate-clusters'
import type { Bounds } from '../../lib/map-filtering'
import { Item } from '../../types/common'
import { getExt, getPrimaryFilename } from '../../utils'
import AlbumContext from '../Context'
import { validatePoint } from '../SlippyMap/options'
import Video from '../Video'
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
  setViewed,
  memoryIndex,
  setMemoryIndex,
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
  setViewed: Viewed;
  memoryIndex: number;
  setMemoryIndex: (n: number) => void;
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

  // Build carousel items
  const carouselItems = useMemo(
    () => items.map(toCarousel),
    [items],
  )

  const safeIndex = carouselItems.length === 0
    ? -1
    : (memoryIndex >= carouselItems.length ? carouselItems.length - 1 : memoryIndex)

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

  // Always use locked centroid during filter or clear, dynamic otherwise
  const effectiveCentroid = (mapFilterEnabled || isClearing) ? lockedCentroid : dynamicCentroid

  const initialIndexRef = useRef(safeIndex)
  const startIndexProp = initialIndexRef.current >= 0 ? initialIndexRef.current : undefined

  // Slide handler with bounds + map flight (only when map filter OFF)
  const handleBeforeSlide: ImageGalleryProps['onBeforeSlide'] = (nextIdxRaw) => {
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

  return (
    <>
      <section className={styles.split}>
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
            clusteredMarkers={clusteredMarkers}
            items={items}
            centroid={effectiveCentroid}
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
