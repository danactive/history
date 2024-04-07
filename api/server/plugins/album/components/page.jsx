const React = require('react');

const Album = require('./album');

const clearLeft = { clear: 'left' };

function Page({ album }) {
  return (
    <html lang="en">
      <head>
        <title>
          History
        </title>
        <meta name="viewport" content="initial-scale=1,maximum-scale=1,user-scalable=no" />
        <link href="https://api.mapbox.com/mapbox-gl-js/v2.14.1/mapbox-gl.css" rel="stylesheet" />
        <link href="./album/static/album-styles.css" rel="stylesheet" />
        <link href="./album/static/map.css" rel="stylesheet" />
      </head>
      <body>
        <div id="divToolbox">
          <button id="linkMap" type="button">
            Map this album
          </button>
        </div>
        <div style={clearLeft} />
        <div id="mapBox" className="hide" />
        <div id="albumBox">
          <Album album={album} />
        </div>
        <script src="./album/static/jquery.js" />
        <script src="./album/static/lib/color-thief.js" />
        <script src="https://api.mapbox.com/mapbox-gl-js/v2.14.1/mapbox-gl.js" />
        <script src="./album/static/assets/bundle.js" />
        <script src="./album/static/utils.js" />
        <script src="./album/static/map.js" />
        <script src="./album/static/album.js" />
      </body>
    </html>
  );
}

module.exports = Page;
