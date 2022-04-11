/* eslint-disable react/jsx-props-no-spreading */
import {
  useContext, useEffect, useState, useRef,
} from 'react'
import MapGL, { Source, Layer } from 'react-map-gl'

import { clusterLayer, clusterCountLayer, unclusteredPointLayer } from './layers'
import { transformMapOptions, transformSourceOptions } from './options'

import AlbumContext from '../Context'

const MAPBOX_TOKEN = 'pk.eyJ1IjoiZGFuYWN0aXZlIiwiYSI6ImNreHhqdXkwdjcyZnEzMHBmNzhiOWZsc3QifQ.gCRigL866hVF6GNHoGoyRg'

export default function SlippyMap({ items = [{}], centroid }) {
  const { geo: { zoom: metaZoom } } = useContext(AlbumContext)
  const coordinates = centroid?.coordinates ?? []
  const zoom = centroid?.coordinateAccuracy ?? metaZoom
  const [viewport, setViewport] = useState(transformMapOptions({ coordinates, zoom }))
  const mapRef = useRef(null)
  useEffect(() => {
    setViewport(transformMapOptions({ coordinates, zoom }))
  }, [centroid])

  const onClick = (event) => {
    const feature = event.features[0]
    if (!feature) return
    const clusterId = feature.properties.cluster_id

    const mapboxSource = mapRef.current.getMap().getSource('slippyMap')

    mapboxSource.getClusterExpansionZoom(clusterId, (err, clickZoom) => {
      if (err) {
        return
      }

      setViewport({
        ...viewport,
        longitude: feature.geometry.coordinates[0],
        latitude: feature.geometry.coordinates[1],
        zoom: clickZoom,
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
      mapStyle="mapbox://styles/mapbox/satellite-streets-v10"
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
