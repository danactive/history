const propTypes = require('prop-types');
const React = require('react');
const VideoListItem = require('./videoListItem.jsx');

const VideoList = (props) => {
  const videoItems = props.videos.map(video =>
    <VideoListItem onVideoSelect={props.onVideoSelect} key={video.etag} video={video} />
  );

  return <nav id="video-list">{videoItems}</nav>;
};

VideoList.propTypes = {
  onVideoSelect: propTypes.func.isRequired,
  videos: propTypes.arrayOf(propTypes.shape()).isRequired
};

module.exports = VideoList;
