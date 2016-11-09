const React = require('react');

const Album = require('./album.jsx');

function Page({ album }) {
  return (
    <html lang="en">
      <head>
        <title>History</title>
        <link rel="stylesheet" href="/view/album/static/album.css" />
      </head>
      <body>
        <div id="albumBox"><Album album={album} /></div>
      </body>
    </html>
  );
}

Page.propTypes = {
  album: React.PropTypes.shape(),
};

module.exports = Page;
