const React = require('react');

const Gallery = require('./gallery.jsx');

function Page({ galleries }) {
  const Galleries = galleries.map((gallery) => <Gallery key={gallery} gallery={gallery} />);
  return (
    <html lang="en">
      <head>
        <title>
          History
        </title>
        <meta name="viewport" content="initial-scale=1,maximum-scale=1,user-scalable=no" />
      </head>
      <body>
        <h1>
          Photo Galleries
        </h1>
        <ul>
          {Galleries}
        </ul>
        <a href="/edit/album">
          Admin &gt; Edit Album
        </a>
      </body>
    </html>
  );
}

module.exports = Page;
