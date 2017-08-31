const propTypes = require('prop-types');
const React = require('react');

const Placeholder = require('./placeholder');

function Contents({ files }) {
  const thumbs = files.map((file) => {
    const href = `?path=${file.path}`;

    if (file.mediumType === 'image') {
      return <Placeholder file={file} key={file.filename} />;
    }

    return <li key={file.filename}><a href={href}>{file.filename}</a></li>;
  });

  return <ul>{thumbs}</ul>;
}

Contents.propTypes = {
  files: propTypes.arrayOf(propTypes.shape({
    ext: propTypes.string,
    filename: propTypes.string.isRequired,
    path: propTypes.string.isRequired,
    mediumType: propTypes.string.isRequired
  })).isRequired
};

module.exports = Contents;
