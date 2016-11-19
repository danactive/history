const React = require('react');

const utils = require('../../utils/lib');

const Source = require('./source.jsx');

function Video({ video }) {
  const sources = video.sources.split(',').map((source) => {
    const extension = utils.file.type(source);
    const id = `${video.gallery}${extension}`;

    return <Source key={id} extension={extension} gallery={video.gallery} source={source} />;
  });

  return (<video controls width={video.w} height={video.h}>{sources}</video>);
}

Video.propTypes = {
  video: React.PropTypes.shape({
    w: React.PropTypes.number.isRequired,
    h: React.PropTypes.number.isRequired,
    gallery: React.PropTypes.string.isRequired,
    sources: React.PropTypes.string.isRequired,
  }),
};

module.exports = Video;
