const React = require('react');

function Page() {
  return (
    <html lang="en">
      <head>
        <title>
          History
        </title>
        <meta name="viewport" content="initial-scale=1,maximum-scale=1,user-scalable=no" />
        <link rel="stylesheet" href="./explore/video/static/style.css" />
      </head>
      <body>
        <section id="video-container" />
        <script src="./explore/video/static/lib/lodash.full.min.js" />
        <script src="./explore/video/static/assets/bundle.js" />
      </body>
    </html>
  );
}

module.exports = Page;
