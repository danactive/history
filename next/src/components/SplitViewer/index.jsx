import ImageGallery from 'react-image-gallery'
import { useContext, useRef } from 'react'
import styled from 'styled-components'

import config from '../../../../config.json'
import { getExt } from '../../utils'
import AlbumContext from '../Context'
import SlippyMap from '../SlippyMap'
import Video from '../Video'

const Split = styled.section`
  display: grid;
  grid-template-columns: 60% 40%;
  grid-template-areas: 'left right';
`

const Left = styled.section`
  grid-area: left;
  height: 80vh;
`

const Right = styled.section`
  grid-area: right;
  height: 80vh;
`

const toCarousel = (item) => {
  const imageGallery = {
    original: item.photoPath || item.thumbPath,
    thumbnail: item.thumbPath,
    description: item.description,
    filename: item.filename,
    mediaPath: item.mediaPath,
  }

  const extension = getExt(item.mediaPath)
  const isVideo = config.supportedFileTypes.video.includes(extension) && item.mediaPath
  if (isVideo) {
    imageGallery.renderItem = ({ original, mediaPath, description }) => (
      <Video
        extension={extension}
        src={mediaPath}
        poster={original}
        description={description}
      />
    )
  }

  return imageGallery
}

function SplitViewer({
  items,
  refImageGallery,
  setViewed = () => {},
  memoryIndex,
  setMemoryIndex,
}) {
  const meta = useContext(AlbumContext)
  const metaZoom = meta?.geo?.zoom ?? 10
  const refMapBox = useRef(null)
  const mapRef = useRef(null)
  const fullscreenMap = () => {
    const div = refMapBox.current
    if (div.requestFullscreen) {
      div.requestFullscreen()
    } else if (div.webkitRequestFullscreen) {
      div.webkitRequestFullscreen()
    } else if (div.msRequestFullScreen) {
      div.msRequestFullScreen()
    } else if (div.mozRequestFullScreen) {
      div.mozRequestFullScreen()
    } else {
      console.error('Failed to fullscreen')
    }
  }
  const carouselItems = items.filter((item) => item.thumbPath).map(toCarousel)
  const handleBeforeSlide = (carouselIndex) => {
    setMemoryIndex(carouselIndex)
    setViewed(carouselIndex)
    mapRef.current.flyTo({
      center: items[carouselIndex].coordinates,
      zoom: metaZoom,
      transitionDuration: 500,
    })
  }
  return (
    <Split>
      <Left key="splitLeft">
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
      </Left>
      <Right key="splitRight" ref={refMapBox}>
        <SlippyMap mapRef={mapRef} items={items} centroid={items[memoryIndex]} />
        <button type="button" onClick={fullscreenMap}>Full Map</button>
      </Right>
    </Split>
  )
}

export default SplitViewer
