const React = require('react');

function Contents({ files }) {
  const thumbs = files.map((file) => {
    const href = `?path=${file.path}`;
    return <li key={file.name}><a href={href}>{file.name}</a></li>;
  });

  return <ul>{thumbs}</ul>;
}

Contents.propTypes = {
  files: React.PropTypes.arrayOf(React.PropTypes.shape({
    ext: React.PropTypes.string,
    name: React.PropTypes.string,
    path: React.PropTypes.string,
    type: React.PropTypes.string
  })).isRequired
};

module.exports = Contents;
