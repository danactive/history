import propTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components';

import A from '../A';
import NormalImg from '../Img';

const Img = styled(NormalImg)`
  width: 21rem;
  height: 14rem;
`;

const Photo = ({ onClick, highsrc, lowsrc }) => (
  <A onClick={onClick}>
    <picture>
      <source media="(min-width: 25rem)" srcSet={highsrc} />
      <source srcSet={lowsrc} />
      <Img src={lowsrc} alt="Preview thumbnail image (scaled down dimensions)" />
    </picture>
  </A>
);

Photo.propTypes = {
  onClick: propTypes.func.isRequired,
  highsrc: propTypes.string,
  lowsrc: propTypes.string.isRequired,
};

export default Photo;
