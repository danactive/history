/* global getQueryByName */
import propTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components';

import NormalImg from '../Img';

const Img = styled(NormalImg)`
  width: 12.5rem;
  height: 9.4rem;
`;

const Thumb = ({ src }) => <Img src={src} alt="Preview thumbnail image (scaled down dimensions)" />;

Thumb.propTypes = {
  src: propTypes.string.isRequired
};

export default Thumb;
