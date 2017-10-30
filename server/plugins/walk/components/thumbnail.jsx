/* global getQueryByName */
const propTypes = require('prop-types');
const React = require('react');

const Thumbnail = ({ filename }) => {
  const imgPath = `/public/static/${getQueryByName('path')}/${filename}`;

  return (<li><img src={imgPath} alt="Preview small dimensions" width="200" height="150" /></li>);
};

Thumbnail.propTypes = {
  filename: propTypes.string.isRequired
};

module.exports = Thumbnail;
