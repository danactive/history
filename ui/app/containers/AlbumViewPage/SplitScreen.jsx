import React from 'react';
import ImageGallery from 'react-image-gallery';
import styled from 'styled-components';
import { useDispatch } from 'react-redux';
import 'react-image-gallery/styles/css/image-gallery.css';

import config from '../../../../config.json';
import { getExt } from '../../utils/path';

import SlippyMap from '../SlippyMap';
import Video from '../../components/VideoPlayerHtml5';

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

const toCarousel = item => {
  const imageGallery = {
    original: item.photoLink || item.thumbLink,
    thumbnail: item.thumbLink,
    description: item.description,
    filename: item.filename,
    videoLink: item.videoLink,
  };

  const extension = getExt(item.filename);
  if (config.supportedFileTypes.video.includes(extension) && item.videoLink) {
    imageGallery.renderItem = itemToRender => (
      <Video
        extension={extension}
        src={itemToRender.videoLink}
        poster={itemToRender.original}
      />
    );
  }

  return imageGallery;
};

function SplitScreen({ currentMemory, memories }) {
  const dispatch = useDispatch();
  const slideTo = index => dispatch(slideToAdjacentMemory(index));

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

export default SplitScreen;
