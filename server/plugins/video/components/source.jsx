const propTypes = require('prop-types');
const React = require('react');

function Source({ extension, gallery, source }) {
  const src = `/static/gallery-${gallery}/media/videos/${source}`;
  let type = '';
  if (extension === 'mp4') {
    type = 'video/mp4; codecs="avc1.4D401E, mp4a.40.2"';
  }

  if (extension === 'webm') {
    type = 'video/webm; codecs="vp8, vorbis"';
  }

  if (extension === 'ogv') {
    type = 'video/ogg; codecs="theora, vorbis"';
  }

  return (<source src={src} type={type} />);
}

Source.propTypes = {
  extension: propTypes.string.isRequired,
  gallery: propTypes.string.isRequired,
  source: propTypes.string.isRequired,
};

module.exports = Source;
