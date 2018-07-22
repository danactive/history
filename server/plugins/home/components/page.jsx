const propTypes = require('prop-types');
const React = require('react');

const Gallery = require('./gallery.jsx');

function Page({ galleries }) {
  const galleryList = galleries.map(gallery => <Gallery key={gallery} gallery={gallery} />);
  return (
    <html lang="en">
      <head>
        <title>
          History
        </title>
        <meta name="viewport" content="initial-scale=1,maximum-scale=1,user-scalable=no" />
      </head>
      <body>
        <h1>
          Photo Galleries
        </h1>
        <ul>
          {galleryList}
        </ul>
        <a href="/admin">
          Admin
        </a>
      </body>
    </html>
  );
}

Page.propTypes = {
  galleries: propTypes.arrayOf(propTypes.string).isRequired,
};

module.exports = Page;
