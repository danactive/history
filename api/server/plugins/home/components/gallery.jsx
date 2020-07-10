const React = require('react');

function Gallery({ gallery }) {
  const xmlPath = `galleries/${gallery}/gallery.xml`;

  return (
    <li>
      <a href={xmlPath}>
        {gallery}
      </a>
    </li>
  );
}

module.exports = Gallery;
