const propTypes = require('prop-types');
const React = require('react');

const VideoListItem = ({ video, onVideoSelect }) => {
  const imageUrl = video.snippet.thumbnails.default.url;

  return (
    <div className="video-list-media" onClick={() => onVideoSelect(video)} role="button" tabIndex="0">
      <div className="media-left">
        <img className="media-object" src={imageUrl} alt="Video thumbnail" />
      </div>

      <div className="media-body">
        <div className="media-heading">
          {video.snippet.title}
        </div>
      </div>
    </div>
  );
};

VideoListItem.propTypes = {
  onVideoSelect: propTypes.func.isRequired,
  video: propTypes.shape({
    snippet: propTypes.shape({
      thumbnails: propTypes.shape({
        default: propTypes.shape({
          url: propTypes.string.isRequired
        }).isRequired
      }).isRequired,
      title: propTypes.string.isRequired
    }).isRequired
  }).isRequired
};

module.exports = VideoListItem;
