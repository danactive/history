const propTypes = require('prop-types');
const React = require('react');

const utils = require('../../utils');

const Source = require('./source.jsx');
const Track = require('./track.jsx');

const components = { Source, Track };

function segmentVideoPath({ componentName, video }) {
  return (source) => {
    const extension = utils.file.type(source);
    const id = `${componentName.toLowerCase()}${video.gallery}${extension}`;
    const Component = components[componentName];

    return <Component key={id} extension={extension} gallery={video.gallery} source={source} />;
  };
}

function renderComponent({ componentName, video }) {
  return video.sources.split(',').map(segmentVideoPath({ componentName, video }));
}

function Video({ video }) {
  const sources = renderComponent({ componentName: 'Source', video });
  const tracks = renderComponent({ componentName: 'Track', video });
  const poster = utils.file.photoPath(utils.file.videoToThumbsPath(video.sources, video.gallery));

  /* eslint-disable jsx-a11y/media-has-caption */
  return (
    <video width={video.w} height={video.h} poster={poster} controls preload="auto" autoPlay="true">
      {sources}
      {tracks}
    </video>
  );
}

Video.propTypes = {
  video: propTypes.shape({
    w: propTypes.number.isRequired,
    h: propTypes.number.isRequired,
    gallery: propTypes.string.isRequired,
    sources: propTypes.string.isRequired,
  }).isRequired,
};

module.exports = Video;
