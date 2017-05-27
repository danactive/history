const React = require('react');

function Track({ extension, gallery, source }) {
  const filename = `${source.replace(`.${extension}`, '')}.vtt`;
  const src = `/static/gallery-${gallery}/media/videos/${filename}`;

  return (<track kind="captions" src={src} srcLang="en" />);
}

Track.propTypes = {
  extension: React.PropTypes.string.isRequired,
  gallery: React.PropTypes.string.isRequired,
  source: React.PropTypes.string.isRequired
};

module.exports = Track;
