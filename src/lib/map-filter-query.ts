import type { Bounds } from './map-filtering'

// GeoJSON bbox order: west, south, east, north.
export const mapBoundsSearchParam = 'bbox'

function isValidCoordinate(value: number, minimum: number, maximum: number) {
  return Number.isFinite(value) && value >= minimum && value <= maximum
}

function formatCoordinate(value: number) {
  return Number(value.toFixed(6)).toString()
}

export function areMapBoundsEqual(first: Bounds | null, second: Bounds | null) {
  return first === second || Boolean(
    first
    && second
    && first[0][0] === second[0][0]
    && first[0][1] === second[0][1]
    && first[1][0] === second[1][0]
    && first[1][1] === second[1][1],
  )
}

export function parseMapBounds(value?: string | null): Bounds | null {
  if (!value) return null

  const parts = value.split(',').map(part => part.trim())
  if (parts.length !== 4 || parts.some(part => !part)) return null

  const coordinates = parts.map(Number)
  const [swLng, swLat, neLng, neLat] = coordinates
  if (
    !isValidCoordinate(swLng, -180, 180)
    || !isValidCoordinate(neLng, -180, 180)
    || !isValidCoordinate(swLat, -90, 90)
    || !isValidCoordinate(neLat, -90, 90)
    || swLng > neLng
    || swLat > neLat
  ) {
    return null
  }

  return [[swLng, swLat], [neLng, neLat]]
}

export function parseMapBoundsParam(value?: string | string[] | null): Bounds | null {
  return typeof value === 'string' ? parseMapBounds(value) : null
}

export function serializeMapBounds(bounds: Bounds) {
  return bounds.flat().map(formatCoordinate).join(',')
}
