const React = require('react');

const Album = require('./album.jsx');

const clearLeft = { clear: 'left' };

function Page({ album }) {
  return (
    <html lang="en">
      <head>
        <title>History</title>
        <meta name="viewport" content="initial-scale=1,maximum-scale=1,user-scalable=no" />
        <link href="/view/album/static/lib/jquery-colorbox/example1/colorbox.css" rel="stylesheet" media="screen" />
        <link rel="stylesheet" href="./album/static/lib/justified-gallery/justifiedGallery.min.css" />
        <link href="https://api.mapbox.com/mapbox-gl-js/v0.27.0/mapbox-gl.css" rel="stylesheet" />
        <link rel="stylesheet" href="./album/static/album.css" />
        <link rel="stylesheet" href="./album/static/map.css" />
      </head>
      <body>
        <div id="divToolbox">
          <button id="linkMap">Map this album</button>
          <button id="igLogin"><a href="http://localhost:8000/view/instagram-login" target="_blank">Login to instagram</a></button>
        </div>
        <div style={clearLeft} />
        <div id="mapBox" className="hide" />
        <div id="albumBox"><Album album={album} /></div>
        <script src="./album/static/jquery.js" />
        <script src="./album/static/lib/jquery-colorbox/jquery.colorbox-min.js" />
        <script src="./album/static/lib/color-thief.js" />
        <script src="./album/static/lib/justified-gallery/jquery.justifiedGallery.min.js" />
        <script src="https://api.mapbox.com/mapbox-gl-js/v0.27.0/mapbox-gl.js" />
        <script src="./album/static/utils.js" />
        <script src="./album/static/map.js" />
        <script src="./album/static/instagram.js" />
        <script src="./album/static/instagram.js" />
        <script src="./album/static/album.js" />
      </body>
    </html>
  );
}

Page.propTypes = {
  album: React.PropTypes.shape(),
};

module.exports = Page;
