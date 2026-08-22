import type { CSSProperties } from 'react'

export type MapMarkerStop = [number, string]
type MapMarkerCssVariables = CSSProperties & Record<`--${string}`, string>

// Keep UI accents tied to the same source as the Mapbox marker ramp. If the
// marker theme changes, these semantic roles follow it automatically.
export const mapMarkerColors = {
  light: '#FFCCCB',
  primary: '#FF6F61',
  hover: '#FF3D00',
  active: '#C62828',
  pressed: '#D32F2F',
  visited: '#9E1B35',
}

export const mapMarkerClusterStops: MapMarkerStop[] = [
  [0, mapMarkerColors.light],
  [10, mapMarkerColors.primary],
  [50, mapMarkerColors.hover],
  [250, mapMarkerColors.active],
  [500, mapMarkerColors.pressed],
  [1000, '#B71C1C'],
  [1500, mapMarkerColors.visited],
]

export const mapMarkerUi = {
  subtle: mapMarkerColors.light,
  primary: mapMarkerColors.primary,
  hover: mapMarkerColors.hover,
  active: mapMarkerColors.active,
  pressed: mapMarkerColors.pressed,
  visited: mapMarkerColors.visited,
}

export const mapMarkerCssVariables: MapMarkerCssVariables = {
  '--map-marker-subtle': mapMarkerUi.subtle,
  '--map-marker-primary': mapMarkerUi.primary,
  '--map-marker-hover': mapMarkerUi.hover,
  '--map-marker-active': mapMarkerUi.active,
  '--map-marker-pressed': mapMarkerUi.pressed,
  '--map-marker-visited': mapMarkerUi.visited,
}
