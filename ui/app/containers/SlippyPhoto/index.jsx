import React from 'react';
import ReactMapboxGl from 'react-mapbox-gl';

import getMapOptions from './options';

const Map = ReactMapboxGl({
  accessToken:
    'pk.eyJ1IjoiZGFuYWN0aXZlIiwiYSI6ImNpdmo0OGo2YTAxcGIyenBkZWZlN3Ewam4ifQ.npY0cY_HdHg1OB692HtcUw',
});

const SlippyPhoto = ({ currentMemory }) => {
  if (!currentMemory) return null;
  const { photoLink, thumbLink } = currentMemory;
  const url = photoLink || thumbLink;

  const top = 9.25;
  const right = 17.5;
  const bottom = 0;
  const left = 0;

  const coordinates = [
    // long lat; start at the top left corner of the image
    [left, top], // top left
    [right, top], // top top
    [right, bottom], // bottom top
    [left, bottom], // bottom left
  ];

  const mapOptions = getMapOptions({ coordinates, url });

  return <Map {...mapOptions} />;
};

export default SlippyPhoto;
