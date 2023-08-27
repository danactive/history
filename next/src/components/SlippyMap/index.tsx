import type { GeoJSONSource } from 'mapbox-gl'
import {
  useContext,
  useEffect,
  useState,
  type MutableRefObject,
} from 'react'
import Map, { Layer, Source, type MapRef } from 'react-map-gl'

import config from '../../../../config.json'
import type { Item } from '../../types/common'
import {
  clusterCountLayer,
  clusterLayer,
  selectedPointLayer,
  unclusteredPointLayer,
} from './layers'
import { transformMapOptions, transformSourceOptions } from './options'

import AlbumContext from '../Context'

const MAPBOX_TOKEN = 'pk.eyJ1IjoiZGFuYWN0aXZlIiwiYSI6ImNreHhqdXkwdjcyZnEzMHBmNzhiOWZsc3QifQ.gCRigL866hVF6GNHoGoyRg'

export default function SlippyMap(
  { items = [], centroid, mapRef }:
  { items: Item[], centroid: Item, mapRef: MutableRefObject<MapRef> },
) {
  const meta = useContext(AlbumContext)
  const metaZoom = meta?.geo?.zoom ?? config.defaultZoom
  const coordinates = centroid?.coordinates ?? null
  const zoom = centroid?.coordinateAccuracy ?? metaZoom
  const [viewport, setViewport] = useState(transformMapOptions({ coordinates, zoom }))

  useEffect(() => {
    setViewport(transformMapOptions({ coordinates, zoom }))
  }, [centroid])
  const onClick = (event) => {
    const feature = event.features[0]
    if (!feature) return
    const clusterId = feature.properties.cluster_id

    const mapboxSource = mapRef.current.getMap().getSource('slippyMap') as GeoJSONSource

    mapboxSource.getClusterExpansionZoom(clusterId, (err, clickZoom) => {
      if (err) {
        return
      }

      mapRef.current.flyTo({
        center: feature.geometry.coordinates,
        zoom: clickZoom,
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
