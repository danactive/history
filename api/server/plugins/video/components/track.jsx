const React = require('react');

function Track({ extension, gallery, source }) {
  const filename = `${source.replace(`.${extension}`, '')}.vtt`;
  const src = `/galleries/${gallery}/media/videos/${filename}`;

  return (<track kind="captions" src={src} srcLang="en" />);
}

module.exports = Track;
