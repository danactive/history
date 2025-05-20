import Color from 'color-thief-react'
import {
  useContext, useRef, type LegacyRef, type ReactNode,
} from 'react'
import ImageGallery, { type ReactImageGalleryItem, type ReactImageGalleryProps } from 'react-image-gallery'
import 'react-image-gallery/styles/css/image-gallery.css'
import type { MapRef } from 'react-map-gl'

import config from '../../../config.json'
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
    original: item.photoPath || item.thumbPath,
    thumbnail: item.thumbPath,
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
}: {
  items: Item[];
  refImageGallery: LegacyRef<ImageGallery> | null;
  setViewed: Viewed;
  memoryIndex: number;
  setMemoryIndex: Function;
}) {
  const meta = useContext(AlbumContext)
  const metaZoom = meta?.geo?.zoom ?? config.defaultZoom
  const refMapBox = useRef<HTMLDivElement>(null)
  const mapRef = useRef<MapRef>(null)
  const fullscreenMap = () => {
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
      console.error('Failed to fullscreen') // eslint-disable-line no-console
    }
  }
  const carouselItems = items.filter((item) => item.thumbPath).map(toCarousel)
  const handleBeforeSlide: ReactImageGalleryProps['onBeforeSlide'] = (carouselIndex) => {
    setMemoryIndex(carouselIndex)
    setViewed(carouselIndex)
    const { isInvalidPoint, latitude, longitude } = validatePoint(items[carouselIndex].coordinates)
    if (mapRef && mapRef.current && !isInvalidPoint) {
      const zoom = items[carouselIndex]?.coordinateAccuracy ?? metaZoom
      mapRef.current.flyTo({
        center: [longitude, latitude],
        zoom,
      })
    }
  }
  return (
    <>
      <Color src={`/_next/image?url=${items[memoryIndex]?.thumbPath}&w=384&q=75`} format="rgbString">
        {({ data: colour }: { data?: string }) => (
          <style global jsx>
            {`.image-gallery, .image-gallery-content.fullscreen, .image-gallery-background {
                background: ${colour};
              }`}
          </style>
        )}
      </Color>
      <section className={`${styles.split} image-gallery-background`}>
        <section className={styles.left} key="splitLeft">
          <ImageGallery
            ref={refImageGallery}
            onBeforeSlide={handleBeforeSlide}
            startIndex={memoryIndex}
            items={carouselItems}
            showPlayButton={false}
            showThumbnails={false}
            slideDuration={550}
            useWindowKeyDown={false}
            lazyLoad
          />
        </section>
        <section className={styles.right} key="splitRight" ref={refMapBox}>
          <SlippyMap mapRef={mapRef} items={items} centroid={items[memoryIndex]} />
          <button type="button" onClick={fullscreenMap}>Full Map</button>
        </section>
      </section>
    </>
  )
}

export default SplitViewer
