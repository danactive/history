'use client'
import 'mapbox-gl/dist/mapbox-gl.css'
import {
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from 'react'
import Map, {
  Layer, Source,
  type ErrorEvent as MapErrorEvent,
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
  getUnclusterPointLayer,
  unclusterLabelLayer,
} from './layers'
import {
  getResolutionForZoom,
  getMarkerSelectionKey,
  transformMapOptions,
  transformSourceOptions,
} from './options'
import { isTransientMapboxNetworkError } from './map-errors'
import styles from './styles.module.css'

const MAPBOX_TOKEN = 'pk.eyJ1IjoiZGFuYWN0aXZlIiwiYSI6ImNreHhqdXkwdjcyZnEzMHBmNzhiOWZsc3QifQ.gCRigL866hVF6GNHoGoyRg'

type SlippyMapProps = {
  clusteredMarkers: ClusteredMarkers;
  items?: Item[];
  centroid?: Item | null;
  mapRef?: RefObject<MapRef | null> | null;
  mapFilterEnabled?: boolean;
  filterBounds?: Bounds | null;
  onMapReady?: () => void;
  onToggleMapFilter?: () => void;
  onBoundsChange?: (bounds: [[number, number], [number, number]]) => void;
}

type ClusterExpansionSource = {
  getClusterExpansionZoom: (
    clusterId: number,
    callback: (error: Error | null, expansionZoom?: number | null) => void,
  ) => void
}

function isCoordinatePair(value: unknown): value is [number, number] {
  return Array.isArray(value)
    && value.length === 2
    && typeof value[0] === 'number'
    && typeof value[1] === 'number'
}

function isClusterExpansionSource(source: unknown): source is ClusterExpansionSource {
  return source !== null
    && typeof source === 'object'
    && 'getClusterExpansionZoom' in source
    && typeof source.getClusterExpansionZoom === 'function'
}

function toBounds(value: unknown): [[number, number], [number, number]] | null {
  if (!Array.isArray(value) || value.length !== 2) return null
  const [southwest, northeast] = value
  if (!isCoordinatePair(southwest) || !isCoordinatePair(northeast)) return null
  return [southwest, northeast]
}

export default function SlippyMap({
  clusteredMarkers,
  items = [],
  centroid = null,
  mapRef,
  mapFilterEnabled = false,
  filterBounds = null,
  onMapReady,
  onToggleMapFilter,
  onBoundsChange,
}: SlippyMapProps) {
  const meta = useContext(AlbumContext)
  const metaZoom = meta?.geo?.zoom ?? config.defaultZoom

  // Always render the map. Prefer the passed centroid, then first item, then a safe default
  const activeCentroid = centroid ?? (items.length > 0 ? items[0] : null)
  const coordinates: [number, number] = activeCentroid?.coordinates ?? [0, 0]
  const zoom = activeCentroid?.coordinateAccuracy ?? metaZoom
  const initialViewport = useMemo(
    () => transformMapOptions({ coordinates, zoom }),
    [coordinates, zoom],
  )

  const currentResolutionRef = useRef(getResolutionForZoom(zoom))
  const [currentResolution, setCurrentResolution] = useState(currentResolutionRef.current)
  const applyingFilterBoundsRef = useRef(false)
  const userMovedMapRef = useRef(false)

  const onClick = (event: MapMouseEvent) => {
    const feature = event.features && event.features[0]
    if (!feature || !mapRef?.current) return
    const clusterId = feature.properties?.cluster_id
    if (clusterId == null) return

    // Narrow geometry to Point before accessing coordinates
    if (feature.geometry.type !== 'Point') return
    const coords = feature.geometry.coordinates
    if (!isCoordinatePair(coords)) return

    const src = mapRef.current.getMap().getSource('slippyMap')
    if (!isClusterExpansionSource(src)) return
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

  // Keep all points stable through photo navigation and camera animation. The
  // selected point is a separate one-feature source below.
  const geoJsonSource = useMemo(
    () => transformSourceOptions({
      items,
      resolution: currentResolution,
      clusteredMarkers,
    }),
    [items, currentResolution, clusteredMarkers],
  )

  const selectedUnclusterPointLayer = useMemo(
    () => getUnclusterPointLayer(getMarkerSelectionKey(activeCentroid?.coordinates ?? null)),
    [activeCentroid?.coordinates],
  )

  const layerIds: string[] = []
  if (clusterPointLayer.id) layerIds.push(clusterPointLayer.id)
  if (clusterCountLayer.id) layerIds.push(clusterCountLayer.id)
  if (clusterLabelLayer.id) layerIds.push(clusterLabelLayer.id)
  if (selectedUnclusterPointLayer.id) layerIds.push(selectedUnclusterPointLayer.id)
  if (unclusterLabelLayer.id) layerIds.push(unclusterLabelLayer.id)

  // Helper to read current bounds immediately
  const readBounds = useCallback((): [[number, number],[number, number]] | null => {
    try {
      const mapInstance = mapRef?.current?.getMap()
      if (!mapInstance) return null
      const boundsObj = mapInstance.getBounds?.()
      if (!boundsObj) return null
      return toBounds(boundsObj.toArray())
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

    const fittedZoom = map.getZoom()
    const nextResolution = getResolutionForZoom(fittedZoom)
    currentResolutionRef.current = nextResolution
    setCurrentResolution(nextResolution)
  }, [filterBounds, mapFilterEnabled, mapRef, readBounds])

  const handleMapLoad = useCallback(() => {
    applyFilterBounds()
    onMapReady?.()
  }, [applyFilterBounds, onMapReady])

  const handleMapError = useCallback((event: MapErrorEvent) => {
    if (isTransientMapboxNetworkError(event.error)) return
    console.error(event.error)
  }, [])

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
    const nextResolution = getResolutionForZoom(evt.viewState.zoom)
    if (nextResolution !== currentResolutionRef.current) {
      currentResolutionRef.current = nextResolution
      setCurrentResolution(nextResolution)
    }
  }, [])

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
          initialViewState={initialViewport}
          ref={mapRef}
          style={{ width: '100%', height: '100%' }}
          mapStyle="mapbox://styles/mapbox/satellite-streets-v12"
          mapboxAccessToken={MAPBOX_TOKEN}
          interactiveLayerIds={layerIds}
          onClick={onClick}
          onError={handleMapError}
          onLoad={handleMapLoad}
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
            <Layer {...selectedUnclusterPointLayer} />
            <Layer {...unclusterLabelLayer} />
          </Source>
        </Map>
      </div>
    </>
  )
}
