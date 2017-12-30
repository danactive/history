import propTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components';

import A from '../A';
import NormalImg from '../Img';

const Img = styled(NormalImg)`
  width: 11.58rem;
  height: 2.82rem;
`;

const Photo = ({ onClick, src }) => <A onClick={onClick}><Img src={src} alt="Preview thumbnail image (scaled down dimensions)" /></A>;

Photo.propTypes = {
  onClick: propTypes.func.isRequired,
  src: propTypes.string.isRequired,
};

export default Photo;
