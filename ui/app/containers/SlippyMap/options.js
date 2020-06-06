const validatePoint = ([longitude = null, latitude = null]) => ({
  latitude,
  longitude,
  isInvalidPoint: longitude === 0
  || latitude === 0
  || longitude === undefined
  || latitude === undefined
  || longitude === null
  || latitude === null
  || Number.isNaN(latitude)
  || Number.isNaN(longitude),
});

export function transformSourceOptions({ items = [] } = {}) {
  const geoJsonFeature = (item) => {
    const {
      latitude,
      longitude,
    } = validatePoint(item.coordinates);

    return {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [longitude, latitude],
      },
      properties: {
        accuracy: item.coordinateAccuracy,
      },
    };
  };

  const hasGeo = (item) => !validatePoint(item.coordinates).isInvalidPoint;
  const features = items.filter(hasGeo).map(geoJsonFeature);

  const data = {
    type: 'FeatureCollection',
    features,
  };

  const options = {
    id: 'thumbs',
    geoJsonSource: {
      type: 'geojson',
      data,
      cluster: true,
      clusterMaxZoom: 13, // Max zoom to cluster points on
      clusterRadius: 50, // Radius of each cluster when clustering points (defaults to 50)
    },
  };

  return options;
}

export function transformMapOptions({ coordinates = [], coordinateAccuracy }) {
  const {
    isInvalidPoint,
    latitude,
    longitude,
  } = validatePoint(coordinates);
  const point = isInvalidPoint ? null : [longitude, latitude];

  const options = {
    containerStyle: {
      height: '100%',
      width: '100%',
    },
    style: 'mapbox://styles/mapbox/satellite-streets-v10',
  };

  if (point) {
    options.center = point;
    options.zoom = [coordinateAccuracy || 17];
  }

  return options;
}

const clusterOptions = {
  id: 'clusters',
  type: 'circle',
  paint: {
    'circle-color': {
      property: 'point_count',
      type: 'interval',
      stops: [
        // https://color.adobe.com/Vitamin-C-color-theme-492199/?showPublished=true
        [0, '#FD7400'],
        [8, '#FFE11A'],
        [20, '#BEDB39'],
        [40, '#1F8A70'],
        [70, '#004358'],
      ],
    },
    'circle-radius': {
      property: 'point_count',
      type: 'interval',
      stops: [
        [0, 20],
        [100, 30],
        [750, 40],
      ],
    },
  },
  filter: ['has', 'point_count'],
  sourceId: 'thumbs',
};

const clusterLabelOptions = {
  id: 'cluster-count',
  type: 'symbol',
  layout: {
    'text-field': '{point_count_abbreviated}',
    'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
    'text-size': 12,
  },
  paint: {
    'text-color': '#000',
  },
  filter: ['has', 'point_count'],
  sourceId: 'thumbs',
};

const markerOptions = {
  id: 'unclustered-marker',
  type: 'circle',
  paint: {
    'circle-color': '#FD7400',
    'circle-radius': 5,
    'circle-stroke-width': 1,
    'circle-stroke-color': '#fff',
  },
  filter: ['all', ['!has', 'point_count'], ['!has', 'accuracy']],
  sourceId: 'thumbs',
};

export function transformInaccurateMarkerOptions({ coordinateAccuracy }) {
  const radius = coordinateAccuracy * 5;

  return {
    id: 'inaccurate-marker',
    type: 'circle',
    paint: {
      'circle-radius': radius,
      'circle-stroke-width': 2,
      'circle-blur': 0.4,
      'circle-stroke-color': '#FFFFFF',
      'circle-stroke-opacity': 0.85,
      'circle-opacity': 0,
    },
    filter: ['has', 'accuracy'],
    sourceId: 'thumbs',
  };
}

export {
  clusterOptions,
  clusterLabelOptions,
  markerOptions,
};
