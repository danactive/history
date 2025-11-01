'use client'
import { type FeatureCollection } from 'geojson'
import type { GeoJSONSource } from 'mapbox-gl'
import {
  useContext,
  useEffect,
  useState,
  type RefObject,
  useRef,
} from 'react'
import Map, {
  Layer, Source, type MapRef, type ViewStateChangeEvent,
} from 'react-map-gl/mapbox'
import 'mapbox-gl/dist/mapbox-gl.css'

import config from '../../../src/models/config'
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

type SlippyMapProps = {
  items?: Item[]
  centroid?: Item | null
  mapRef?: RefObject<MapRef | null> | null
  mapFilterEnabled?: boolean
  onToggleMapFilter?: () => void
  onBoundsChange?: (bounds: [[number, number], [number, number]]) => void
}

export default function SlippyMap({
  items = [],
  centroid = null,
  mapRef,
  mapFilterEnabled = false,
  onToggleMapFilter,
  onBoundsChange,
}: SlippyMapProps) {
  const meta = useContext(AlbumContext)
  const metaZoom = meta?.geo?.zoom ?? config.defaultZoom

  // Always render the map. Prefer the passed centroid, then first item, then a safe default
  const activeCentroid = centroid ?? (items.length > 0 ? items[0] : null)
  const coordinates = activeCentroid?.coordinates ?? [0, 0]
  const zoom = activeCentroid?.coordinateAccuracy ?? metaZoom

  // Track previous coordinates/zoom to avoid unnecessary updates
  const prevCoordsRef = useRef<[number, number]>([0, 0])
  const prevZoomRef = useRef<number>(metaZoom)

  // avoid calling transformMapOptions during SSR (it may access window/mapbox)
  const [viewport, setViewport] = useState(() => {
    if (typeof window === 'undefined') return {} as any
    return transformMapOptions({ coordinates, zoom })
  })

  useEffect(() => {
    if (typeof window === 'undefined') return

    // Only update if coordinates or zoom actually changed
    const [prevLng, prevLat] = prevCoordsRef.current
    const [lng, lat] = coordinates
    const prevZoom = prevZoomRef.current

    if (prevLng === lng && prevLat === lat && prevZoom === zoom) {
      return // No change, skip update
    }

    // Update refs and viewport
    prevCoordsRef.current = coordinates
    prevZoomRef.current = zoom
    setViewport(transformMapOptions({ coordinates, zoom }))
  }, [coordinates, zoom])

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

  const toggleStyle: React.CSSProperties = {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 10,
    background: 'rgba(255,255,255,0.9)',
    borderRadius: 6,
    padding: 6,
    cursor: 'pointer',
  }

  const handleMove = (evt: ViewStateChangeEvent) => {
    setViewport(evt.viewState)

    // Only report bounds to parent when map-based filtering is enabled.
    // This avoids expensive parent updates while the user is panning/zooming
    // when the map filter is OFF and keeps mouse interactions smooth.
    if (!mapFilterEnabled) return

    const mr = mapRef?.current
    if (mr && typeof onBoundsChange === 'function') {
      try {
        const map = mr.getMap?.()
        if (!map) return
        const bounds = map.getBounds().toArray() as [[number, number],[number, number]]
        onBoundsChange(bounds)
      } catch {
        // ignore mapbox errors during SSR or unavailable map
      }
    }
  }

  return (
    <>
      <style global jsx>
        {`
        .mapboxgl-control-container {
          display: none;
        }
      `}
      </style>

      {/* Ensure the map container has an explicit height so Mapbox can render */}
      <div style={{ position: 'relative', width: '100%', height: '360px', minHeight: 300 }}>
        <div style={toggleStyle} role="button" onClick={onToggleMapFilter} aria-pressed={mapFilterEnabled} title="Toggle map filter">
          <span style={{ fontSize: 12, fontWeight: 600 }}>{mapFilterEnabled ? 'Map filter: ON' : 'Map filter: OFF'}</span>
        </div>

        <Map
          {...viewport}
          ref={mapRef}
          // ensure the Map fills the container
          style={{ width: '100%', height: '100%' }}
          mapStyle="mapbox://styles/mapbox/satellite-streets-v11"
          mapboxAccessToken={MAPBOX_TOKEN}
          interactiveLayerIds={layerIds}
          /*
          // @ts-ignore */
          onClick={onClick}
          onMove={handleMove}
        >
          <Source id="slippyMap" {...geoJsonSource}>
            <Layer {...clusterLayer} />
            <Layer {...clusterCountLayer} />
            <Layer {...selectedPointLayer} />
            <Layer {...unclusteredPointLayer} />
          </Source>
        </Map>
      </div>
    </>
  )
}
