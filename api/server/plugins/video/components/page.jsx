const React = require('react');

const Video = require('./video');

const body = { margin: 0, padding: 0 };

function Page({ video }) {
  return (
    <html lang="en">
      <head>
        <title>
          History
        </title>
        <meta name="viewport" content="initial-scale=1,maximum-scale=1,user-scalable=no" />
      </head>
      <body style={body}>
        <Video video={video} />
      </body>
    </html>
  );
}

module.exports = Page;
