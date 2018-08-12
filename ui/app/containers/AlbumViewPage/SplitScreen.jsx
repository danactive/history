import React from 'react';
import PropTypes from 'prop-types';

import PhotoImg from '../../components/PhotoImg';
import SlippyMap from '../SlippyMap';

function SplitScreen({ currentMemory }) {
  if (currentMemory) {
    return (
      <div>
        <PhotoImg
          highsrc={currentMemory.photoLink}
          lowsrc={currentMemory.thumbLink}
          onClick={() => console.log('Photo clicked')} // eslint-disable-line no-console
        />
        <SlippyMap
          current={currentMemory}
        />
      </div>
    );
  }

  return null;
}

SplitScreen.defaultProps = {
  currentMemory: null,
};

SplitScreen.propTypes = {
  currentMemory: PropTypes.shape({
    photoLink: PropTypes.string,
    thumbLink: PropTypes.string,
  }),
};

export default SplitScreen;
