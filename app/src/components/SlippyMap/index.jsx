/* eslint-disable react/jsx-props-no-spreading */
import { useState, useRef } from 'react'
import MapGL, { Source, Layer } from 'react-map-gl'

import { clusterLayer, clusterCountLayer, unclusteredPointLayer } from './layers'
import { transformSourceOptions } from './options'

const MAPBOX_TOKEN = 'pk.eyJ1IjoiZGFuYWN0aXZlIiwiYSI6ImNreHhqdXkwdjcyZnEzMHBmNzhiOWZsc3QifQ.gCRigL866hVF6GNHoGoyRg'

export default function SlippyMap({ items }) {
  const [viewport, setViewport] = useState({
    latitude: 40.67,
    longitude: -103.59,
    zoom: 3,
    bearing: 0,
    pitch: 0,
  })
  const mapRef = useRef(null)

  const onClick = (event) => {
    const feature = event.features[0]
    const clusterId = feature.properties.cluster_id

    const mapboxSource = mapRef.current.getMap().getSource('slippyMap')

    mapboxSource.getClusterExpansionZoom(clusterId, (err, zoom) => {
      if (err) {
        return
      }

      setViewport({
        ...viewport,
        longitude: feature.geometry.coordinates[0],
        latitude: feature.geometry.coordinates[1],
        zoom,
        transitionDuration: 500,
      })
    })
  }

  const geoJsonSource = transformSourceOptions({ items })
  return (
    <MapGL
      {...viewport}
      width="100%"
      height="100%"
      mapStyle="mapbox://styles/mapbox/dark-v9"
      onViewportChange={setViewport}
      mapboxApiAccessToken={MAPBOX_TOKEN}
      interactiveLayerIds={[clusterLayer.id]}
      onClick={onClick}
      ref={mapRef}
    >
      <Source id="slippyMap" {...geoJsonSource}>
        <Layer {...clusterLayer} />
        <Layer {...clusterCountLayer} />
        <Layer {...unclusteredPointLayer} />
      </Source>
    </MapGL>
  )
}
