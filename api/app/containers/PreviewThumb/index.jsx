/* global getQueryByName */
import React from 'react';

import ThumbImg from '../../components/ThumbImg';

const PreviewThumb = ({ filename }) => {
  const imgPath = `/public/static/${getQueryByName('path')}/${filename}`;

  return (<ThumbImg src={imgPath} />);
};

module.exports = PreviewThumb;
