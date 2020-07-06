import React from 'react';

import VideoPlayerHTML5 from '../Loadable';

import { getHostToken } from '../../../utils/host';

const HISTORY_API_ROOT = getHostToken('local');

export default {
  title: 'VideoPlayerHTML5',
  component: VideoPlayerHTML5,
};

export const Video = () => (
  <VideoPlayerHTML5
    extension="mp4"
    poster={`${HISTORY_API_ROOT}/static/gallery-demo/media/photos/2012/2012-fireplace.jpg`}
    src={`${HISTORY_API_ROOT}/static/gallery-demo/media/videos/2012-fireplace.mp4`}
  />
);
