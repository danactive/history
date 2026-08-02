'use client'
import type { GeoJSONSource } from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from 'react'
import Map, {
  Layer, Source,
  type MapMouseEvent,
  type MapRef, type ViewStateChangeEvent,
} from 'react-map-gl/mapbox'
import config from '../../../src/models/config'
import type { ClusteredMarkers } from '../../lib/generate-clusters'
import { areMapBoundsEqual } from '../../lib/map-filter-query'
import type { Bounds } from '../../lib/map-filtering'
import type { Item } from '../../types/common'
import AlbumContext from '../Context'
import {
  clusterCountLayer,
  clusterLabelLayer,
  clusterPointLayer,
  selectedLabelLayer,
  selectedPointLayer,
  unclusterLabelLayer,
  unclusterPointLayer,
} from './layers'
import { getResolutionForZoom, transformMapOptions, transformSourceOptions } from './options'
import styles from './styles.module.css'

const MAPBOX_TOKEN = 'pk.eyJ1IjoiZGFuYWN0aXZlIiwiYSI6ImNreHhqdXkwdjcyZnEzMHBmNzhiOWZsc3QifQ.gCRigL866hVF6GNHoGoyRg'

type SlippyMapProps = {
  clusteredMarkers: ClusteredMarkers;
  items?: Item[];
  centroid?: Item | null;
  mapRef?: RefObject<MapRef | null> | null;
  mapFilterEnabled?: boolean;
  filterBounds?: Bounds | null;
  onToggleMapFilter?: () => void;
  onBoundsChange?: (bounds: [[number, number], [number, number]]) => void;
}

export default function SlippyMap({
  clusteredMarkers,
  items = [],
  centroid = null,
  mapRef,
  mapFilterEnabled = false,
  filterBounds = null,
  onToggleMapFilter,
  onBoundsChange,
}: SlippyMapProps) {
  const meta = useContext(AlbumContext)
  const metaZoom = meta?.geo?.zoom ?? config.defaultZoom

  // Always render the map. Prefer the passed centroid, then first item, then a safe default
  const activeCentroid = centroid ?? (items.length > 0 ? items[0] : null)
  const coordinates: [number, number] = (activeCentroid?.coordinates as [number, number]) ?? [0, 0]
  const zoom = activeCentroid?.coordinateAccuracy ?? metaZoom
  const initialViewport = useMemo(
    () => transformMapOptions({ coordinates, zoom }),
    [coordinates, zoom],
  )

  // Track previous coordinates/zoom to avoid unnecessary updates
  const prevCoordsRef = useRef<[number, number]>(coordinates)
  const prevZoomRef = useRef<number>(zoom)

  const [currentResolution, setCurrentResolution] = useState(() =>
    getResolutionForZoom(zoom),
  )
  const [currentZoom, setCurrentZoom] = useState(zoom)

  const [viewport, setViewport] = useState(() => initialViewport)
  const applyingFilterBoundsRef = useRef(false)
  const userMovedMapRef = useRef(false)

  useEffect(() => {
    // Only update if coordinates or zoom actually changed
    const [prevLng, prevLat] = prevCoordsRef.current
    const [lng, lat] = coordinates
    const prevZoom = prevZoomRef.current
    if (prevLng === lng && prevLat === lat && prevZoom === zoom) return
    prevCoordsRef.current = coordinates
    prevZoomRef.current = zoom
    setViewport(initialViewport)
    setCurrentZoom(zoom)
    setCurrentResolution(getResolutionForZoom(zoom))
  }, [coordinates, initialViewport, zoom])

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
      if (mapFilterEnabled) {
        userMovedMapRef.current = true
      }
      mapRef.current?.flyTo({
        center: coords,
        zoom: expansionZoom,
      })
    })
  }

  // Pass current zoom to transformSourceOptions
  const geoJsonSource = useMemo(
    () => transformSourceOptions({
      items,
      selected: { coordinates },
      zoom: currentZoom,
      clusteredMarkers,
    }),
    [items, coordinates, currentZoom, clusteredMarkers],
  )

  const layerIds: string[] = []
  if (clusterPointLayer.id) layerIds.push(clusterPointLayer.id)
  if (clusterCountLayer.id) layerIds.push(clusterCountLayer.id)
  if (clusterLabelLayer.id) layerIds.push(clusterLabelLayer.id)
  if (selectedPointLayer.id) layerIds.push(selectedPointLayer.id)
  if (unclusterPointLayer.id) layerIds.push(unclusterPointLayer.id)
  if (unclusterLabelLayer.id) layerIds.push(unclusterLabelLayer.id)

  // Helper to read current bounds immediately
  const readBounds = useCallback((): [[number, number],[number, number]] | null => {
    try {
      const mapInstance = mapRef?.current?.getMap()
      if (!mapInstance) return null
      const boundsObj = mapInstance.getBounds?.()
      if (!boundsObj) return null
      return boundsObj.toArray() as [[number, number],[number, number]]
    } catch {
      return null
    }
  }, [mapRef])

  const applyFilterBounds = useCallback(() => {
    if (!mapFilterEnabled || !filterBounds) return

    const currentBounds = readBounds()
    if (areMapBoundsEqual(currentBounds, filterBounds)) return

    applyingFilterBoundsRef.current = true
    userMovedMapRef.current = false
    const map = mapRef?.current
    if (!map) return

    map.fitBounds(filterBounds, { duration: 0 })

    // The map is controlled by `viewport`, so adopt the fitted camera rather
    // than letting the selected photo's initial viewport overwrite it.
    const center = map.getCenter()
    const fittedZoom = map.getZoom()
    setViewport(previousViewport => ({
      ...previousViewport,
      longitude: center.lng,
      latitude: center.lat,
      zoom: fittedZoom,
    }))
    setCurrentZoom(fittedZoom)
    setCurrentResolution(getResolutionForZoom(fittedZoom))
  }, [filterBounds, mapFilterEnabled, mapRef, readBounds])

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

  const handleMove = useCallback((evt: ViewStateChangeEvent) => {
    setViewport(evt.viewState)

    // Update zoom and check if resolution changed
    const newZoom = evt.viewState.zoom
    setCurrentZoom(newZoom)
    const newResolution = getResolutionForZoom(newZoom)
    if (newResolution !== currentResolution) {
      setCurrentResolution(newResolution)
    }
  }, [currentResolution])

  const handleMoveEnd = useCallback(() => {
    if (!mapFilterEnabled || !onBoundsChange) return

    // Fitting a bookmarked bbox fires map move events. It must not replace the
    // saved bounds with Mapbox's aspect-ratio-adjusted viewport.
    if (applyingFilterBoundsRef.current) {
      applyingFilterBoundsRef.current = false
      userMovedMapRef.current = false
      return
    }

    if (!userMovedMapRef.current) return
    userMovedMapRef.current = false

    const bounds = readBounds()
    if (bounds) onBoundsChange(bounds)
  }, [mapFilterEnabled, onBoundsChange, readBounds])

  return (
    <>
      <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: 300 }}>
        <button
          type="button"
          className={styles.toggleButton}
          onClick={handleToggleClick}
          aria-pressed={mapFilterEnabled}
          title="Toggle map filter"
        >
          {mapFilterEnabled ? 'Map filter: ON' : 'Map filter: OFF'}
        </button>
        <Map
          {...viewport}
          ref={mapRef}
          style={{ width: '100%', height: '100%' }}
          mapStyle="mapbox://styles/mapbox/satellite-streets-v11"
          mapboxAccessToken={MAPBOX_TOKEN}
          interactiveLayerIds={layerIds}
          onClick={onClick}
          onLoad={applyFilterBounds}
          onMouseDown={() => { userMovedMapRef.current = true }}
          onTouchStart={() => { userMovedMapRef.current = true }}
          onWheel={() => { userMovedMapRef.current = true }}
          onMove={handleMove}
          onMoveEnd={handleMoveEnd}
        >
          <Source id="slippyMap" {...geoJsonSource}>
            <Layer {...clusterPointLayer} />
            <Layer {...clusterCountLayer} />
            <Layer {...clusterLabelLayer} />
            <Layer {...selectedPointLayer} />
            <Layer {...selectedLabelLayer} />
            <Layer {...unclusterPointLayer} />
            <Layer {...unclusterLabelLayer} />
          </Source>
        </Map>
      </div>
    </>
  )
}
