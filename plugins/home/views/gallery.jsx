const React = require('react');

function Gallery({ gallery }) {
  const xmlPath = `static/gallery-${gallery}/xml/gallery.xml`;

  return (<li><a href={xmlPath}>{gallery}</a></li>);
}

Gallery.propTypes = {
  gallery: React.PropTypes.string.isRequired,
};

module.exports = Gallery;
