const propTypes = require('prop-types');
const React = require('react');

const Contents = require('./contents.jsx');

function Page({ files }) {
  return (
    <html lang="en">
      <head>
        <title>History</title>
        <meta name="viewport" content="initial-scale=1,maximum-scale=1,user-scalable=no" />
      </head>
      <body>
        <Contents files={files} />
        <script src="../walk/static/bundle.js" />
      </body>
    </html>
  );
}

Page.propTypes = {
  files: propTypes.arrayOf(propTypes.shape()).isRequired
};

module.exports = Page;
