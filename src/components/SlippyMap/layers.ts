import type { LayerProps } from 'react-map-gl/mapbox'

export const clusterLayer: LayerProps = {
  id: 'clusters',
  type: 'circle',
  filter: ['has', 'point_count'],
  paint: {
    'circle-color': {
      property: 'point_count',
      type: 'interval',
      stops: [
        // https://color.adobe.com/Flame-Colors-color-theme-11113856
        [0, '#FFBF2D'],
        [250, '#FF9428'],
        [500, '#FF6107'],
        [1000, '#E83400'],
        [1500, '#9E1300'],
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
}

export const clusterCountLayer: LayerProps = {
  id: 'cluster-count',
  type: 'symbol',
  filter: ['has', 'point_count'],
  layout: {
    'text-field': '{point_count}',
    'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
    'text-size': 12,
  },
}

export const selectedPointLayer: LayerProps = {
  id: 'selected-point',
  type: 'circle',
  filter: ['has', 'selected'],
  paint: {
    'circle-color': '#FFFFFF',
    'circle-radius': 6,
    'circle-stroke-width': 4,
    'circle-stroke-color': '#000',
  },
}

export const unclusteredPointLayer: LayerProps = {
  id: 'unclustered-point',
  type: 'circle',
  filter: ['all', ['!', ['has', 'point_count']], ['!', ['has', 'selected']]],
  paint: {
    'circle-color': '#ffd881',
    'circle-radius': 4,
    'circle-stroke-width': 2,
    'circle-stroke-color': '#000',
  },
}
