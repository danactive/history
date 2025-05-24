import { type FeatureCollection } from 'geojson'
import type { GeoJSONSource } from 'mapbox-gl'
import {
  useContext,
  useEffect,
  useState,
  type RefObject,
} from 'react'
import Map, {
  Layer, Source, type MapRef, type ViewStateChangeEvent,
} from 'react-map-gl/mapbox'

import config from '../../../config.json'
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
  { items = [], centroid = null, mapRef }:
  { items: Item[], centroid: Item | null, mapRef: RefObject<MapRef> | null },
) {
  const meta = useContext(AlbumContext)
  const metaZoom = meta?.geo?.zoom ?? config.defaultZoom
  const { coordinates } = centroid ?? { coordinates: [0, 0] }
  const zoom = centroid?.coordinateAccuracy ?? metaZoom
  const [viewport, setViewport] = useState(transformMapOptions({ coordinates, zoom }))

  useEffect(() => {
    setViewport(transformMapOptions({ coordinates, zoom }))
  }, [centroid])

  if (centroid === null) {
    return null
  }

  const onClick = (event: FeatureCollection) => {
    const feature = event.features[0]
    if (!(feature && mapRef?.current)) {
      return
    }
    const clusterId = feature.properties?.cluster_id

    const mapboxSource = mapRef.current.getMap().getSource('slippyMap') as GeoJSONSource

    mapboxSource.getClusterExpansionZoom(clusterId, (err, clickZoom) => {
      if (err) {
        return
      }
      const zoomNotNull = clickZoom === null ? undefined : clickZoom // dep upgrade changed type rules

      if (mapRef?.current) {
        mapRef.current.flyTo({
          // @ts-ignore
          center: feature.geometry.coordinates,
          zoom: zoomNotNull,
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
        /*
        // @ts-ignore */
        onClick={onClick}
        onMove={(evt: ViewStateChangeEvent) => setViewport(evt.viewState)}
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
