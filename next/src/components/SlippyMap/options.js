const validatePoint = (rawCoordinate) => {
  const coordinate = rawCoordinate ?? []
  const [longitude = null, latitude = null] = coordinate
  return {
    latitude,
    longitude,
    isInvalidPoint:
      longitude === 0
      || latitude === 0
      || longitude === undefined
      || latitude === undefined
      || longitude === null
      || latitude === null
      || Number.isNaN(latitude)
      || Number.isNaN(longitude),
  }
}

export function transformSourceOptions({ items = [], selected } = {}) {
  const geoJsonFeature = (item) => {
    const { latitude, longitude } = validatePoint(item.coordinates)
    const { latitude: selectedLatitude, longitude: selectedLongitude } = validatePoint(selected.coordinates)

    const point = {
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

  const hasGeo = (item) => !validatePoint(item?.coordinates).isInvalidPoint
  const features = items.filter(hasGeo).map(geoJsonFeature)

  const data = {
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

export function transformMapOptions({ coordinates = [], zoom } = {}) {
  if (coordinates === null) return {}
  const { isInvalidPoint, latitude, longitude } = validatePoint(coordinates)

  const options = {}
  if (!isInvalidPoint) {
    options.latitude = latitude
    options.longitude = longitude
    options.zoom = zoom
    options.bearing = 0
    options.pitch = 0
    options.transitionDuration = 'auto'
  }

  return options
}

export function transformInaccurateMarkerOptions({ coordinateAccuracy }) {
  const radius = coordinateAccuracy * 5

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
  }
}
