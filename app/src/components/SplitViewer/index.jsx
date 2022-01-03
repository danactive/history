import ImageGallery from 'react-image-gallery'
import styled from 'styled-components'

import config from '../../../../config.json'
import { getExt } from '../../utils'
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

const SplitViewer = ({ items, refImageGallery }) => (
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
      <SlippyMap items={items} />
    </Right>
  </Split>
)

export default SplitViewer
