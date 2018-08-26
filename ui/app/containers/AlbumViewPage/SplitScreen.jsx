import React from 'react';
import PropTypes from 'prop-types';

import PhotoImg from '../../components/PhotoImg';
import SlippyMap from '../SlippyMap';

function SplitScreen({ currentMemory, items }) {
  if (currentMemory) {
    return (
      <div>
        <PhotoImg
          highsrc={currentMemory.photoLink}
          lowsrc={currentMemory.thumbLink}
          onClick={() => console.log('Photo clicked')} // eslint-disable-line no-console
        />
        <SlippyMap
          geo={currentMemory.geo}
          items={items}
        />
      </div>
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
