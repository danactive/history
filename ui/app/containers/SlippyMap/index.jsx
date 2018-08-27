import React from 'react';
import PropTypes from 'prop-types';
import ReactMapboxGl, { Layer, Source } from 'react-mapbox-gl';

import {
  clusterOptions,
  clusterLabelOptions,
  unclusterOptions,
  transformMapOptions,
  transformSourceOptions,
} from './options';

const Map = ReactMapboxGl({
  accessToken: 'pk.eyJ1IjoiZGFuYWN0aXZlIiwiYSI6ImNpdmo0OGo2YTAxcGIyenBkZWZlN3Ewam4ifQ.npY0cY_HdHg1OB692HtcUw',
});

const SlippyMap = ({ items, geo }) => (
  <Map {...transformMapOptions(geo)}>
    <Source {...transformSourceOptions(items)} />
    <Layer {...clusterOptions} />
    <Layer {...clusterLabelOptions} />
    <Layer {...unclusterOptions} />
  </Map>
);

SlippyMap.defaultProps = {
  current: {},
  items: [],
};

SlippyMap.propTypes = {
  current: PropTypes.shape({
    geo: PropTypes.arrayOf(PropTypes.number),
  }),
  items: PropTypes.arrayOf(PropTypes.shape({
    geo: PropTypes.arrayOf(PropTypes.number),
  })),
};

export default SlippyMap;
