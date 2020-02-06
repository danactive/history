import React from 'react';

function handleKeyPress(event) {
  if (event.key === 'Enter') {
    event.target.click();
  }
}

export default function VideoListItem({ index, video, onVideoSelect }) {
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
}
