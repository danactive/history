import React from 'react';
import PropTypes from 'prop-types';
import ReactMapboxGl, { Marker } from 'react-mapbox-gl';

const Map = ReactMapboxGl({
  accessToken: 'pk.eyJ1IjoiZGFuYWN0aXZlIiwiYSI6ImNpdmo0OGo2YTAxcGIyenBkZWZlN3Ewam4ifQ.npY0cY_HdHg1OB692HtcUw',
});

function SlippyMap({ current }) {
  const {
    geo: [longitude, latitude],
  } = current;

  const point = !Number.isNaN(longitude) ? [longitude, latitude] : null;

  const mapObjects = (point) ? (
    <Marker
      coordinates={point}
      anchor="bottom"
    >
      HI
    </Marker>
  ) : null;

  const mapOptions = {
    containerStyle: {
      height: '100vh',
      width: '100vw',
    },
    style: 'mapbox://styles/mapbox/satellite-streets-v10',
    zoom: [9],
  };

  if (point) {
    mapOptions.center = point;
    mapOptions.zoom = [14];
  }

  return (
    <Map {...mapOptions}>
      {mapObjects}
    </Map>
  );
}

SlippyMap.propTypes = {
  current: PropTypes.shape({
    geo: PropTypes.arrayOf(PropTypes.number),
  }).isRequired,
  // items: PropTypes.arrayOf(PropTypes.shape).isRequired,
};

export default SlippyMap;
