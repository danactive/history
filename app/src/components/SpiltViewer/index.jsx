import ImageGallery from 'react-image-gallery'
import 'react-image-gallery/styles/css/image-gallery.css'
import styled from 'styled-components'

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
    videoPath: item.videoPath,
  }

  return imageGallery
}

const SplitViewer = ({ items }) => (
  <Split>
    <Left key="splitLeft">
      <ImageGallery
        items={items.filter((item) => item.thumbPath).map(toCarousel)}
        showPlayButton={false}
        showThumbnails={false}
        slideDuration={550}
        lazyLoad
      />
    </Left>
    <Right key="splitRight">
      Right
    </Right>
  </Split>
)

export default SplitViewer
