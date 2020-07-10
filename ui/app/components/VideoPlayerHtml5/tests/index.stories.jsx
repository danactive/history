import React from 'react';

import VideoPlayerHTML5 from '../Loadable';

import { getHostToken } from '../../../utils/host';

const CDN_HOST = getHostToken('cdn');

export default {
  title: 'VideoPlayerHTML5',
  component: VideoPlayerHTML5,
};

export const Video = () => (
  <VideoPlayerHTML5
    extension="mp4"
    poster={`${CDN_HOST}/demo/media/photos/2012/2012-fireplace.jpg`}
    src={`${CDN_HOST}/demo/media/videos/2012-fireplace.mp4`}
  />
);
