'use client'
import type { GeoJSONSource } from 'mapbox-gl'
import {
  useContext,
  useEffect,
  useState,
  type RefObject,
  useRef,
  useCallback,
  useMemo,
} from 'react'
import Map, {
  Layer, Source, type MapRef, type ViewStateChangeEvent, type MapMouseEvent,
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
  const coordinates: [number, number] = (activeCentroid?.coordinates as [number, number]) ?? [0, 0]
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
    if (prevLng === lng && prevLat === lat && prevZoom === zoom) return
    prevCoordsRef.current = coordinates
    prevZoomRef.current = zoom
    setViewport(transformMapOptions({ coordinates, zoom }))
  }, [coordinates, zoom])

  const onClick = (event: MapMouseEvent) => {
    const feature = event.features && event.features[0]
    if (!feature || !mapRef?.current) return
    const clusterId = feature.properties?.cluster_id
    if (clusterId == null) return

    // Narrow geometry to Point before accessing coordinates
    if (feature.geometry.type !== 'Point') return
    const coords = (feature.geometry as GeoJSON.Point).coordinates as [number, number]

    const src = mapRef.current.getMap().getSource('slippyMap') as GeoJSONSource
    src.getClusterExpansionZoom(clusterId, (err: any, expansionZoom?: number | null) => {
      if (err || expansionZoom == null) return
      mapRef.current?.flyTo({
        center: coords,
        zoom: expansionZoom,
      })
    })
  }

  const geoJsonSource = useMemo(
    () => transformSourceOptions({ items, selected: { coordinates } }),
    [items, coordinates],
  )

  const layerIds: string[] = []
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

  // Helper to read current bounds immediately
  const readBounds = (): [[number, number],[number, number]] | null => {
    try {
      const mapInstance = mapRef?.current?.getMap()
      if (!mapInstance) return null
      const boundsObj = mapInstance.getBounds?.()
      if (!boundsObj) return null
      return boundsObj.toArray() as [[number, number],[number, number]]
    } catch {
      return null
    }
  }

  // Wrap toggle so enabling the filter captures bounds instantly (no move needed)
  const handleToggleClick = () => {
    const nextEnabled = !mapFilterEnabled
    onToggleMapFilter?.()
    if (nextEnabled && onBoundsChange) {
      const b = readBounds()
      if (b) onBoundsChange(b)
    }
    // When disabling, onToggleMapFilter clears bounds already
  }

  const moveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const handleMove = useCallback((evt: ViewStateChangeEvent) => {
    setViewport(evt.viewState)
    if (!mapFilterEnabled || !onBoundsChange) return
    if (moveTimeoutRef.current) clearTimeout(moveTimeoutRef.current)
    moveTimeoutRef.current = setTimeout(() => {
      const b = readBounds()
      if (b) onBoundsChange(b)
    }, 100)
  }, [mapFilterEnabled, onBoundsChange, mapRef])

  useEffect(() => () => {
    if (moveTimeoutRef.current) clearTimeout(moveTimeoutRef.current)
  }, [])

  return (
    <>
      <style global jsx>{'.mapboxgl-control-container{display:none;}'}</style>
      <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: 300 }}>
        <div
          style={toggleStyle}
          role="button"
          onClick={handleToggleClick}
          aria-pressed={mapFilterEnabled}
          title="Toggle map filter"
        >
          <span style={{ fontSize: 12, fontWeight: 600 }}>
            {mapFilterEnabled ? 'Map filter: ON' : 'Map filter: OFF'}
          </span>
        </div>
        <Map
          {...viewport}
          ref={mapRef}
          style={{ width: '100%', height: '100%' }}
          mapStyle="mapbox://styles/mapbox/satellite-streets-v11"
          mapboxAccessToken={MAPBOX_TOKEN}
          interactiveLayerIds={layerIds}
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
