import React from 'react';
import ImageGallery from 'react-image-gallery';
import styled from 'styled-components';
import 'react-image-gallery/styles/css/image-gallery.css';

import SlippyMap from '../SlippyMap';

const Split = styled.section`
  display: grid;
  grid-template-columns: 60% 40%;
  grid-template-areas: "left right";
`;

const Left = styled.section`
  grid-area: left;
  height: 80vh;
`;

const Right = styled.section`
  grid-area: right;
  height: 80vh;
`;

function SplitScreen({ currentMemory, items }) {
  const toCarousel = item => ({
    original: item.photoLink,
    thumbnail: item.thumbLink,
  });

  if (currentMemory) {
    return (
      <Split>
        <Left key="splitLeft">
          <ImageGallery items={items.map(toCarousel)} />
        </Left>
        <Right key="splitRight">
          <SlippyMap
            currentMemory={currentMemory}
            items={items}
          />
        </Right>
      </Split>
    );
  }

  return null;
}

export default SplitScreen;
