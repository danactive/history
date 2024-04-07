import type { GeoJSONSourceRaw, LayerProps, ViewState } from 'react-map-gl'
import type { Feature, FeatureCollection } from 'geojson'

import config from '../../../config.json'

import type { Item } from '../../types/common'

interface SelectedFeature extends Feature {
  properties: {
    selected?: boolean;
  }
}

export const validatePoint = (
  coordinates:
  Item['coordinates'],
) => {
  const [longitude, latitude] = coordinates ?? [0, 0]
  return {
    latitude,
    longitude,
    isInvalidPoint:
      longitude === 0
      || latitude === 0
      || Number.isNaN(latitude)
      || Number.isNaN(longitude),
  }
}

type ItemWithCoordinate = {
  coordinates: Item['coordinates']
}

export function transformSourceOptions(
  { items = [], selected }:
  { items?: Item[], selected: ItemWithCoordinate },
): GeoJSONSourceRaw {
  const geoJsonFeature = (item: Item): SelectedFeature => {
    const { latitude, longitude } = validatePoint(item.coordinates)
    const { latitude: selectedLatitude, longitude: selectedLongitude } = validatePoint(selected.coordinates)

    const point: SelectedFeature = {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [longitude, latitude],
      },
      properties: {},
    }

    if (selectedLatitude === latitude && selectedLongitude === longitude) {
      point.properties.selected = true
    }

    return point
  }

  const hasGeo = (item: Item) => !validatePoint(item?.coordinates).isInvalidPoint
  const features = items.filter(hasGeo).map(geoJsonFeature)

  const data: FeatureCollection = {
    type: 'FeatureCollection',
    features,
  }

  return {
    type: 'geojson',
    data,
    cluster: true,
    clusterMaxZoom: 13, // Max zoom to cluster points on
    clusterRadius: 50, // Radius of each cluster when clustering points (defaults to 50)
  }
}

export function transformMapOptions(
  { coordinates, zoom = config.defaultZoom } :
  { coordinates: Item['coordinates'], zoom?: number },
): ViewState | {} {
  if (coordinates === null) return {}
  const { isInvalidPoint, latitude, longitude } = validatePoint(coordinates)

  const options = {} as ViewState
  if (!isInvalidPoint) {
    options.latitude = latitude
    options.longitude = longitude
    options.zoom = zoom
    options.bearing = 0
    options.pitch = 0
  }

  return options
}

export function transformInaccurateMarkerOptions(coordinateAccuracy: Item['coordinateAccuracy']): LayerProps {
  const radius = (coordinateAccuracy ?? 0) * 5

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
  }
}
