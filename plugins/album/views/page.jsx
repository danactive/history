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
        <link href="https://api.mapbox.com/mapbox-gl-js/v0.27.0/mapbox-gl.css" rel="stylesheet" />
        <link rel="stylesheet" href="/view/album/static/album.css" />
        <link rel="stylesheet" href="/view/album/static/map.css" />
      </head>
      <body>
        <div id="divToolbox">
          <button id="linkMap">Map this album</button>
        </div>
        <div style={clearLeft} />
        <div id="mapBox" className="hide" />
        <div id="albumBox"><Album album={album} /></div>
        <script src="/view/album/static/lib/jquery/dist/jquery.min.js" />
        <script src="/view/album/static/lib/jquery-colorbox/jquery.colorbox-min.js" />
        <script src="/view/album/static/lib/color-thief.js" />
        <script src="https://api.mapbox.com/mapbox-gl-js/v0.27.0/mapbox-gl.js" />
        <script src="/view/album/static/utils.js" />
        <script src="/view/album/static/map.js" />
        <script src="/view/album/static/album.js" />
      </body>
    </html>
  );
}

Page.propTypes = {
  album: React.PropTypes.shape(),
};

module.exports = Page;
