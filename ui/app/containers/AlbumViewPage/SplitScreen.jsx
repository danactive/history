import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import SlippyPhoto from '../SlippyPhoto';
import SlippyMap from '../SlippyMap';

const Split = styled.section`
  display: grid;
  grid-template-columns: 60% 40%;
  grid-template-areas: "left right";
`;

const Left = styled.section`
  grid-area: left;
  height: 80vh;
`;

const Right = styled.section`
  grid-area: right;
  height: 80vh;
`;

function SplitScreen({ currentMemory, items }) {
  if (currentMemory) {
    return (
      <Split>
        <Left key="splitLeft">
          <SlippyPhoto
            currentMemory={currentMemory}
          />
        </Left>
        <Right key="splitRight">
          <SlippyMap
            currentMemory={currentMemory}
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
    coordinates: PropTypes.arrayOf(PropTypes.number),
    photoLink: PropTypes.string,
    thumbLink: PropTypes.string,
  }),
  items: PropTypes.arrayOf(PropTypes.shape({
    coordinates: PropTypes.arrayOf(PropTypes.number),
  })),
};

export default SplitScreen;
