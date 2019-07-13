import React from 'react';
import ReactMapboxGl from 'react-mapbox-gl';

import getMapOptions from './options';

const Map = ReactMapboxGl({
  accessToken: 'pk.eyJ1IjoiZGFuYWN0aXZlIiwiYSI6ImNpdmo0OGo2YTAxcGIyenBkZWZlN3Ewam4ifQ.npY0cY_HdHg1OB692HtcUw',
});

const SlippyPhoto = ({ currentMemory }) => {
  if (!currentMemory) return null;

  return (
    <Map {...getMapOptions(currentMemory)} />
  );
};

export default SlippyPhoto;
