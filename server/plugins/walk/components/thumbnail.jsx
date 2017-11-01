/* global getQueryByName */
import propTypes from 'prop-types';
import React from 'react';

import ThumbImg from '../../../../app/components/ThumbImg';

const PreviewThumb = ({ filename }) => {
  const imgPath = `/public/static/${getQueryByName('path')}/${filename}`;

  return (<ThumbImg src={imgPath} />);
};


PreviewThumb.propTypes = {
  filename: propTypes.string.isRequired
};

module.exports = PreviewThumb;
