import React from 'react';

import VideoPlayerHTML5 from '../Loadable';

import { apiPort } from '../../../../../config.json';

export default {
  title: 'VideoPlayerHTML5',
  component: VideoPlayerHTML5,
};

export const Video = () => (
  <VideoPlayerHTML5
    extension="mp4"
    poster={`http://localhost:${apiPort}/static/gallery-demo/media/photos/2012/2012-fireplace.jpg`}
    src={`http://localhost:${apiPort}/static/gallery-demo/media/videos/2012-fireplace.mp4`}
  />
);
