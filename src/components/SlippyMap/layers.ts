import type { LayerProps } from 'react-map-gl/mapbox'
import { mapMarkerClusterStops, mapMarkerColors } from './marker-theme'

const marker = {
  types: {
    cluster: {
      filter: ['has', 'point_count'],
      id: 'cluster',
    },
    uncluster: {
      filter: ['!', ['has', 'point_count']],
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
      stops: mapMarkerClusterStops,
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

export const unclusterPointLayer: LayerProps = {
  id: `${marker.types.uncluster.id}-points`,
  type: 'circle',
  filter: marker.types.uncluster.filter,
  paint: {
    'circle-color': mapMarkerColors.light,
    'circle-radius': 10,
    'circle-stroke-width': 2,
    'circle-stroke-color': '#000',
  },
}

export function getUnclusterPointLayer(selectedKey: string | null): LayerProps {
  const isSelected = ['==', ['get', 'selectionKey'], selectedKey ?? ''] as const

  return {
    id: unclusterPointLayer.id,
    type: 'circle',
    filter: marker.types.uncluster.filter,
    paint: {
      'circle-color': ['case', isSelected, '#FFFFFF', mapMarkerColors.light],
      'circle-radius': 10,
      'circle-stroke-width': ['case', isSelected, 4, 2],
      'circle-stroke-color': '#000',
    },
  }
}

export const unclusterLabelLayer: LayerProps = {
  id: `${marker.types.uncluster.id}-labels`,
  type: 'symbol',
  filter: marker.types.uncluster.filter,
  layout: marker.label.layout,
  paint: marker.label.paint,
}
