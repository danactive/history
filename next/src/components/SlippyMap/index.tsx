/* eslint-disable react/jsx-props-no-spreading */
import { useContext, useEffect, useState } from 'react'
import Map, { Source, Layer } from 'react-map-gl'

import config from '../../../../config.json'
import {
  clusterLayer, clusterCountLayer, unclusteredPointLayer, selectedPointLayer,
} from './layers'
import { transformMapOptions, transformSourceOptions } from './options'

import AlbumContext from '../Context'

const MAPBOX_TOKEN = 'pk.eyJ1IjoiZGFuYWN0aXZlIiwiYSI6ImNreHhqdXkwdjcyZnEzMHBmNzhiOWZsc3QifQ.gCRigL866hVF6GNHoGoyRg'

export default function SlippyMap({ items = [], centroid, mapRef }) {
  const meta = useContext(AlbumContext)
  const metaZoom = meta?.geo?.zoom ?? config.defaultZoom
  const coordinates = centroid?.coordinates ?? []
  const zoom = centroid?.coordinateAccuracy ?? metaZoom
  const [viewport, setViewport] = useState(transformMapOptions({ coordinates, zoom }))

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

      mapRef.current.flyTo({
        center: feature.geometry.coordinates,
        zoom: clickZoom,
        transitionDuration: 500,
      })
    })
  }

  const geoJsonSource = transformSourceOptions({ items, selected: { coordinates } })

  return (
    <>
      <style global jsx>
        {`
        .mapboxgl-control-container {
          display: none;
        }
      `}
      </style>
      <Map
        {...viewport}
        ref={mapRef}
        mapStyle="mapbox://styles/mapbox/satellite-streets-v11"
        mapboxAccessToken={MAPBOX_TOKEN}
        interactiveLayerIds={[clusterLayer.id, clusterCountLayer.id, selectedPointLayer.id, unclusteredPointLayer.id]}
        onClick={onClick}
        onMove={(evt) => setViewport(evt.viewState)}
      >
        <Source id="slippyMap" {...geoJsonSource}>
          <Layer {...clusterLayer} />
          <Layer {...clusterCountLayer} />
          <Layer {...selectedPointLayer} />
          <Layer {...unclusteredPointLayer} />
        </Source>
      </Map>
    </>
  )
}
