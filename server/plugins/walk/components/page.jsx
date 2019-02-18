const React = require('react');

const Contents = require('./contents.jsx');
const walkFiles = require('../lib/files');

function Page({ files }) {
  const hasImage = files.some(walkFiles.areImages);

  return (
    <html lang="en">
      <head>
        <title>
          History
        </title>
        <meta name="viewport" content="initial-scale=1,maximum-scale=1,user-scalable=no" />
      </head>
      <body>
        <section id="controls" data-has-image={hasImage} />
        <Contents files={files} />
        <script src="../walk/static/utils.js" />
        <script src="../walk/static/assets/bundle.js" />
      </body>
    </html>
  );
}

module.exports = Page;
