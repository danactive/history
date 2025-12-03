import type { LayerProps } from 'react-map-gl/mapbox'

type MapboxStop = [number, string];

const swatches: Record<string, MapboxStop[]> = {
  christmas: [
    [0, '#FFCCCB'],
    [10, '#FF6F61'],
    [50, '#FF3D00'],
    [250, '#C62828'],
    [500, '#D32F2F'],
    [1000, '#B71C1C'],
    [1500, '#9E1B35'],
  ],
}

const marker = {
  types: {
    cluster: {
      filter: ['has', 'point_count'],
      id: 'cluster',
    },
    selected: {
      filter: ['has', 'selected'],
      id: 'selected',
    },
    uncluster: {
      filter: ['all', ['!', ['has', 'point_count']], ['!', ['has', 'selected']]],
      id: 'uncluster',
    },
  },
  label: {
    layout: {
      'text-field': '{label}',
      'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
      'text-size': 13,
      'text-offset': [0, 2.2], // offset below the circle
    },
    paint: {
      'text-color': '#000',
      'text-halo-color': '#fff',
      'text-halo-width': 5,
    },
  },
}

export const clusterPointLayer: LayerProps = {
  id: `${marker.types.cluster.id}-points`,
  type: 'circle',
  filter: marker.types.cluster.filter,
  paint: {
    'circle-color': {
      property: 'point_count',
      type: 'interval',
      stops: swatches.christmas,
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
}

export const clusterCountLayer: LayerProps = {
  id: `${marker.types.cluster.id}-count`,
  type: 'symbol',
  filter: marker.types.cluster.filter,
  layout: {
    'text-field': '{point_count}',
    'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
    'text-size': 12,
  },
}

export const clusterLabelLayer: LayerProps = {
  id: `${marker.types.cluster.id}-labels`,
  type: 'symbol',
  filter: marker.types.cluster.filter,
  layout: {
    'text-field': '{commonLabel}',
    'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
    'text-size': 12,
    'text-offset': [0, 3.5], // offset below the circle
  },
  paint: marker.label.paint,
}

export const selectedPointLayer: LayerProps = {
  id: `${marker.types.selected.id}-points`,
  type: 'circle',
  filter: marker.types.selected.filter,
  paint: {
    'circle-color': '#FFFFFF',
    'circle-radius': 10,
    'circle-stroke-width': 4,
    'circle-stroke-color': '#000',
  },
}

export const selectedLabelLayer: LayerProps = {
  id: `${marker.types.selected.id}-labels`,
  type: 'symbol',
  filter: marker.types.selected.filter,
  layout: marker.label.layout,
  paint: marker.label.paint,
}


export const unclusterPointLayer: LayerProps = {
  id: `${marker.types.uncluster.id}-points`,
  type: 'circle',
  filter: marker.types.uncluster.filter,
  paint: {
    'circle-color': swatches.christmas[0][1],
    'circle-radius': 10,
    'circle-stroke-width': 2,
    'circle-stroke-color': '#000',
  },
}

export const unclusterLabelLayer: LayerProps = {
  id: `${marker.types.uncluster.id}-labels`,
  type: 'symbol',
  filter: marker.types.uncluster.filter,
  layout: marker.label.layout,
  paint: marker.label.paint,
}
