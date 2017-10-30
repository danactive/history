const propTypes = require('prop-types');
const React = require('react');

const VideoDetail = ({ video }) => {
  if (!video) {
    return <section>Loading...</section>;
  }

  const { videoId } = video.id;
  const url = `https://www.youtube.com/embed/${videoId}`;

  return (
    <main id="video-detail">
      <section id="video-player"><iframe title="YouTube video player" src={url} /></section>
      <section id="video-text">
        <div id="video-title">{video.snippet.title}</div>
        <div id="video-description">{video.snippet.description}</div>
      </section>
    </main>
  );
};

VideoDetail.defaultProps = {
  video: null
};

VideoDetail.propTypes = {
  video: propTypes.shape()
};

module.exports = VideoDetail;
