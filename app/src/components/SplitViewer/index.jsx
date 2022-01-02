import { useState } from 'react'
import ImageGallery from 'react-image-gallery'
import ReactMapGL from 'react-map-gl'
import styled from 'styled-components'

import config from '../../../../config.json'
import { getExt } from '../../utils'
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
    imageGallery.renderItem = ({ original, mediaPath }) => (
      <Video
        extension={extension}
        src={mediaPath}
        poster={original}
      />
    )
  }

  return imageGallery
}

const SplitViewer = ({ items, refImageGallery }) => {
  const [viewport, setViewport] = useState({
    latitude: 37.7577,
    longitude: -122.4376,
    zoom: 8,
  })

  return (
    <Split>
      <Left key="splitLeft">
        <ImageGallery
          ref={refImageGallery}
          items={items.filter((item) => item.thumbPath).map(toCarousel)}
          showPlayButton={false}
          showThumbnails={false}
          slideDuration={550}
          lazyLoad
        />
      </Left>
      <Right key="splitRight">
        <ReactMapGL
          mapboxApiAccessToken="pk.eyJ1IjoiZGFuYWN0aXZlIiwiYSI6ImNreHhqdXkwdjcyZnEzMHBmNzhiOWZsc3QifQ.gCRigL866hVF6GNHoGoyRg"
          latitude={viewport.latitude}
          longitude={viewport.longitude}
          zoom={viewport.zoom}
          width="100%"
          height="100%"
          onViewportChange={setViewport}
        />
      </Right>
    </Split>
  );
}

export default SplitViewer
