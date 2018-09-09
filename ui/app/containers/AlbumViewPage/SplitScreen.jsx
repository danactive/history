import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import SlippyPhoto from '../SlippyPhoto';
import SlippyMap from '../SlippyMap';

const Split = styled.section`
  display: grid;
  grid-template-columns: 50% 50%;
  grid-template-areas: "left right";
`;

const Left = styled.section`
  grid-area: left;
`;

const Right = styled.section`
  grid-area: right;
`;

function SplitScreen({ currentMemory, items }) {
  if (currentMemory) {
    return (
      <Split>
        <Left key="splitLeft">
          <SlippyPhoto
            geo={currentMemory.geo}
            items={items}
          />
        </Left>
        <Right key="splitRight">
          <SlippyMap
            geo={currentMemory.geo}
            items={items}
          />
        </Right>
      </Split>
    );
  }

  return null;
}

SplitScreen.defaultProps = {
  currentMemory: null,
  items: null,
};

SplitScreen.propTypes = {
  currentMemory: PropTypes.shape({
    geo: PropTypes.arrayOf(PropTypes.number),
    photoLink: PropTypes.string,
    thumbLink: PropTypes.string,
  }),
  items: PropTypes.arrayOf(PropTypes.shape({
    geo: PropTypes.arrayOf(PropTypes.number),
  })),
};

export default SplitScreen;
