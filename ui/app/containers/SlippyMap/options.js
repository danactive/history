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
  || Number.isNaN(longitude)
});

export function transformSourceOptions(items = []) {
  const hasGeo = item => !validatePoint(item.coordinates).isInvalidPoint;
  const features = items.filter(hasGeo).map((item) => {
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
      properties: {},
    };
  });

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
      clusterMaxZoom: 14, // Max zoom to cluster points on
      clusterRadius: 50, // Radius of each cluster when clustering points (defaults to 50)
    },
  };

  return options;
}

export function transformMapOptions(coordinates = []) {
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
    options.zoom = [16];
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

const unclusterOptions = {
  id: 'unclustered-point',
  type: 'circle',
  paint: {
    'circle-color': '#FD7400',
    'circle-radius': 5,
    'circle-stroke-width': 1,
    'circle-stroke-color': '#fff',
  },
  filter: ['!has', 'point_count'],
  sourceId: 'thumbs',
};

export {
  clusterOptions,
  clusterLabelOptions,
  unclusterOptions,
}
