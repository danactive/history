import React from 'react';
import ImageGallery from 'react-image-gallery';
import { connect } from 'react-redux';
import { compose } from 'redux';
import styled from 'styled-components';
import 'react-image-gallery/styles/css/image-gallery.css';

import SlippyMap from '../SlippyMap';

import { slideToAdjacentMemory } from './actions';

const Split = styled.section`
  display: grid;
  grid-template-columns: 60% 40%;
  grid-template-areas: 'left right';
`;

const Left = styled.section`
  grid-area: left;
  height: 80vh;
`;

const Right = styled.section`
  grid-area: right;
  height: 80vh;
`;

function SplitScreen({ currentMemory, slideTo, memories }) {
  const toCarousel = item => ({
    original: item.photoLink || item.thumbLink,
    thumbnail: item.thumbLink,
    description: item.description,
  });

  if (currentMemory) {
    return (
      <Split>
        <Left key="splitLeft">
          <ImageGallery
            onBeforeSlide={slideTo}
            items={memories.filter(item => item.thumbLink).map(toCarousel)}
            disableKeyDown
            showThumbnails={false}
            slideDuration={550}
            startIndex={memories.findIndex(m => m.id === currentMemory.id)}
          />
        </Left>
        <Right key="splitRight">
          <SlippyMap currentMemory={currentMemory} items={memories} />
        </Right>
      </Split>
    );
  }

  return null;
}

const mapDispatchToProps = dispatch => ({
  slideTo: index => dispatch(slideToAdjacentMemory(index)),
});

const withConnect = connect(null, mapDispatchToProps);

export default compose(withConnect)(SplitScreen);
