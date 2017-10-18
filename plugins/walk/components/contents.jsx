const propTypes = require('prop-types');
const React = require('react');

const Placeholder = require('./placeholder');
const utils = require('../../utils');

function Contents({ files }) {
  const thumbs = files.map((file) => {
    if (file.mediumType === 'image' && utils.config.get('supportedFileTypes.photo').includes(file.ext)) {
      return <Placeholder file={file} key={file.filename} />;
    }

    if (file.mediumType === 'folder') {
      const href = `?path=${file.path}`;
      return <li key={file.filename}><a href={href}>{file.filename}</a></li>;
    }

    return <li key={file.filename}>{file.filename}</li>;
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
