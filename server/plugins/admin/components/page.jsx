const React = require('react');

function Page() {
  return (
    <html lang="en">
      <head>
        <title>
          History
        </title>
        <meta name="viewport" content="initial-scale=1,maximum-scale=1,user-scalable=no" />
      </head>
      <body>
        <ul>
          <li>
            <a href="/admin/get_geocode_via_map.html">
              Get geocode via map
            </a>
            {' '}
            (Broken)
          </li>
          <li>
            <a href="/edit/album">
              Edit Album
            </a>
          </li>
          <li>
            <a href="/admin/walk-path">
              Walk todo photos
            </a>
            {' '}
            (Broken)
          </li>
          <li>
            <a href="/admin/diff-album-path">
              Compare album XML to filenames
            </a>
            {' '}
            (Broken)
          </li>
        </ul>
        <h3>
          Harness
        </h3>
        <ul>
          <li>
            <a href="map.htm">
              Slippy map cycle through pins one at a time
            </a>
            {' '}
            (Broken)
          </li>
          <li>
            <a href="albumXml.htm">
              Convert album XML to JSON
            </a>
            {' '}
            (Broken)
          </li>
          <li>
            <a href="../public/justifiedGallery.htm?lat=49.25&amp;lon=-123.1">
              Flickr fully justified gallery
            </a>
            {' '}
            (Broken)
          </li>
        </ul>
      </body>
    </html>
  );
}

module.exports = Page;
