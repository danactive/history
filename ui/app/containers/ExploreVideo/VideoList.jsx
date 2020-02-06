import React from 'react';
import VideoListItem from './VideoListItem';

export default function VideoList(props) {
  const {
    onVideoSelect,
    videos,
  } = props;
  const videoItems = videos.map((video, index) => <VideoListItem index={index} onVideoSelect={onVideoSelect} key={video.etag} video={video} />);

  return (
    <nav id="video-list">
      {videoItems}
    </nav>
  );
}
