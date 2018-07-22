const propTypes = require('prop-types');
const React = require('react');

function Track({ extension, gallery, source }) {
  const filename = `${source.replace(`.${extension}`, '')}.vtt`;
  const src = `/static/gallery-${gallery}/media/videos/${filename}`;

  return (<track kind="captions" src={src} srcLang="en" />);
}

Track.propTypes = {
  extension: propTypes.string.isRequired,
  gallery: propTypes.string.isRequired,
  source: propTypes.string.isRequired,
};

module.exports = Track;
