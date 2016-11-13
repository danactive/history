const React = require('react');

const Album = require('./album.jsx');

function Page({ album }) {
  return (
    <html lang="en">
      <head>
        <title>History</title>
        <link href="/view/album/static/lib/jquery-colorbox/example1/colorbox.css" rel="stylesheet" media="screen" />
        <link rel="stylesheet" href="/view/album/static/album.css" />
      </head>
      <body>
        <div id="albumBox"><Album album={album} /></div>
        <script src="/view/album/static/lib/jquery/dist/jquery.min.js"></script>
        <script src="/view/album/static/lib/jquery-colorbox/jquery.colorbox-min.js"></script>
        <script src="/view/album/static/lib/color-thief.js"></script>
        <script src="/view/album/static/album.js"></script>
      </body>
    </html>
  );
}

Page.propTypes = {
  album: React.PropTypes.shape(),
};

module.exports = Page;
