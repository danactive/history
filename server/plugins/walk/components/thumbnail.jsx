/* global getQueryByName */
import propTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components';

import NormalImg from '../../../../app/components/Img';

const Img = styled(NormalImg)`
  width: 12.5rem;
  height: 9.4rem;
`;

const Thumbnail = ({ filename }) => {
  const imgPath = `/public/static/${getQueryByName('path')}/${filename}`;

  return (<Img src={imgPath} alt="Preview small dimensions" />);
};

Thumbnail.propTypes = {
  filename: propTypes.string.isRequired
};

export default Thumbnail;
