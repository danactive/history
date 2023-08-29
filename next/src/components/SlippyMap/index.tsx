import type { GeoJSONSource } from 'mapbox-gl'
import {
  useContext,
  useEffect,
  useState,
  type RefObject,
} from 'react'
import Map, { Layer, Source, type MapRef } from 'react-map-gl'

import config from '../../../../config.json'
import type { Item } from '../../types/common'
import AlbumContext from '../Context'
import {
  clusterCountLayer,
  clusterLayer,
  selectedPointLayer,
  unclusteredPointLayer,
} from './layers'
import { transformMapOptions, transformSourceOptions } from './options'

const MAPBOX_TOKEN = 'pk.eyJ1IjoiZGFuYWN0aXZlIiwiYSI6ImNreHhqdXkwdjcyZnEzMHBmNzhiOWZsc3QifQ.gCRigL866hVF6GNHoGoyRg'

export default function SlippyMap(
  { items = [], centroid, mapRef }:
  { items: Item[], centroid: Item, mapRef: RefObject<MapRef> | null },
) {
  const meta = useContext(AlbumContext)
  const metaZoom = meta?.geo?.zoom ?? config.defaultZoom
  const { coordinates } = centroid
  const zoom = centroid?.coordinateAccuracy ?? metaZoom
  const [viewport, setViewport] = useState(transformMapOptions({ coordinates, zoom }))

  useEffect(() => {
    setViewport(transformMapOptions({ coordinates, zoom }))
  }, [centroid])
  const onClick = (event) => {
    const feature = event.features[0]
    if (!(feature && mapRef?.current)) {
      return
    }
    const clusterId = feature.properties.cluster_id

    const mapboxSource = mapRef.current.getMap().getSource('slippyMap') as GeoJSONSource

    mapboxSource.getClusterExpansionZoom(clusterId, (err, clickZoom) => {
      if (err) {
        return
      }

      if (mapRef?.current) {
        mapRef.current.flyTo({
          center: feature.geometry.coordinates,
          zoom: clickZoom,
        })
      }
    })
  }

  const geoJsonSource = transformSourceOptions({ items, selected: { coordinates } })
  const layerIds = []
  if (clusterLayer.id) layerIds.push(clusterLayer.id)
  if (clusterCountLayer.id) layerIds.push(clusterCountLayer.id)
  if (selectedPointLayer.id) layerIds.push(selectedPointLayer.id)
  if (unclusteredPointLayer.id) layerIds.push(unclusteredPointLayer.id)

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
        interactiveLayerIds={layerIds}
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
