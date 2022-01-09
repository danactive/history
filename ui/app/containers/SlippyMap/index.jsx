import React from 'react';
import ReactMapboxGl, { Layer, Source } from 'react-mapbox-gl';

import {
  clusterOptions,
  clusterLabelOptions,
  markerOptions,
  transformInaccurateMarkerOptions,
  transformMapOptions,
  transformSourceOptions,
} from './options';

const Map = ReactMapboxGl({
  accessToken:
    'pk.eyJ1IjoiZGFuYWN0aXZlIiwiYSI6ImNreHhqdXkwdjcyZnEzMHBmNzhiOWZsc3QifQ.gCRigL866hVF6GNHoGoyRg',
});

const SlippyMap = ({
  currentMemory: { coordinates, coordinateAccuracy } = {},
  items,
}) => (
  <Map {...transformMapOptions({ coordinates, coordinateAccuracy })}>
    <Source {...transformSourceOptions({ items })} />
    <Layer {...clusterOptions} />
    <Layer {...clusterLabelOptions} />
    <Layer {...markerOptions} />
    <Layer {...transformInaccurateMarkerOptions({ coordinateAccuracy })} />
  </Map>
);

export default SlippyMap;
