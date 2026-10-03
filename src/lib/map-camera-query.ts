import type { Bounds } from './map-filtering'
import { parseMapBounds, serializeMapBounds } from './map-filter-query'

export type MapCamera = { longitude: number; latitude: number; zoom: number }
type SearchParams = Pick<URLSearchParams, 'getAll'>

function readNumber(params: SearchParams, key: string, min: number, max: number) {
  const values = params.getAll(key)
  if (values.length !== 1 || !/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(values[0])) return null
  const value = Number(values[0])
  return Number.isFinite(value) && value >= min && value <= max ? value : null
}

export function parseMapCamera(params: SearchParams, defaultZoom: number): MapCamera | null {
  const longitude = readNumber(params, 'longitude', -180, 180)
  const latitude = readNumber(params, 'latitude', -90, 90)
  if (longitude === null || latitude === null) return null
  return { longitude, latitude, zoom: readNumber(params, 'zoom', 0, 22) ?? defaultZoom }
}

export function wrapLongitude(value: number) {
  return ((value + 180) % 360 + 360) % 360 - 180
}

export function writeMapCamera(params: URLSearchParams, camera: MapCamera) {
  params.set('longitude', String(Number(wrapLongitude(camera.longitude).toFixed(6))))
  params.set('latitude', String(Number(Math.max(-90, Math.min(90, camera.latitude)).toFixed(6))))
  params.set('zoom', String(Number(Math.max(0, Math.min(22, camera.zoom)).toFixed(3))))
}

/** Retain the existing single-interval bbox contract, including world copies. */
export function normalizeMapBounds(bounds: Bounds): Bounds {
  const [[west, south], [east, north]] = bounds
  const span = east - west
  const start = wrapLongitude(west)
  const end = start + span
  const broad = span >= 360 || span < 0 || end > 180
  const normalized: Bounds = [
    [broad ? -180 : start, Math.max(-90, Math.min(90, south))],
    [broad ? 180 : end, Math.max(-90, Math.min(90, north))],
  ]
  // Use precisely the same rounded bounds in memory and in a reopened URL.
  return parseMapBounds(serializeMapBounds(normalized)) ?? [[-180, -90], [180, 90]]
}
