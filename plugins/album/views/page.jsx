const React = require('react');

const Album = require('./album.jsx');

const clearLeft = { clear: 'left' };

function Page({ album }) {
  return (
    <html lang="en">
      <head>
        <title>History</title>
        <meta name="viewport" content="initial-scale=1,maximum-scale=1,user-scalable=no" />
        <link href="https://api.mapbox.com/mapbox-gl-js/v0.31.0/mapbox-gl.css" rel="stylesheet" />
        <link href="./album/static/album.css" rel="stylesheet" />
        <link href="./album/static/map.css" rel="stylesheet" />
        <link href="./album/static/justifiedGallery.min.css" rel="stylesheet" />
        <link href="./album/static/nearBy.css" rel="stylesheet" />
      </head>
      <body>
        <div id="divToolbox">
          <button id="linkMap">Map this album</button>
        </div>
        <div style={clearLeft} />
        <div id="mapBox" className="hide" />
        <div id="albumBox"><Album album={album} />
        </div>
        <div id="mygallery" />
        <script src="./album/static/jquery.js" />
        <script src="./album/static/lib/color-thief.js" />
        <script src="./album/static/lib/jquery.justifiedGallery.min.js" />
        <script src="https://api.mapbox.com/mapbox-gl-js/v0.31.0/mapbox-gl.js" />
        <script src="./album/static/assets/bundle.js" />
        <script src="./album/static/utils.js" />
        <script src="./album/static/map.js" />
        <script src="./album/static/album.js" />
        <script src="./album/static/nearBy.js" />
      </body>
    </html>
  );
}

Page.propTypes = {
  album: React.PropTypes.shape().isRequired,
};

module.exports = Page;
