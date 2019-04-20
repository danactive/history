const React = require('react');

function handleKeyPress(event) {
  if (event.key === 'Enter') {
    event.target.click();
  }
}

const VideoListItem = ({ index, video, onVideoSelect }) => {
  const tabOffset = 2;
  const imageUrl = video.snippet.thumbnails.default.url;

  return (
    <div className="video-list-media" onClick={() => onVideoSelect(video)} onKeyPress={handleKeyPress} role="button" tabIndex={tabOffset + index}>
      <div className="media-thumbnail">
        <img src={imageUrl} alt="Video thumbnail" />
      </div>

      <div className="media-heading">
        {video.snippet.title}
      </div>
    </div>
  );
};

module.exports = VideoListItem;
