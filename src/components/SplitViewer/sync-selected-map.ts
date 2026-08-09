import type { GeoJSONSource } from 'mapbox-gl'
import type { FeatureCollection } from 'geojson'
import type { MapRef } from 'react-map-gl/mapbox'

import type { Item } from '../../types/common'
import { transformSelectedSourceOptions, validatePoint } from '../SlippyMap/options'

type SyncSelectedMapOptions = {
  mapRef: Pick<MapRef, 'flyTo' | 'getMap'>;
  item: Item | null;
  defaultZoom: number;
  shouldFly: boolean;
  previousFlightKey: string | null;
}

/**
 * Update the one-feature selected source synchronously. This intentionally
 * avoids touching the static, clustered source while a gallery transition is
 * still doing its own work.
 */
export function syncSelectedMap({
  mapRef,
  item,
  defaultZoom,
  shouldFly,
  previousFlightKey,
}: SyncSelectedMapOptions): string | null {
  const map = mapRef.getMap()
  const selectedSource = map.getSource('selectedSlippyMap') as GeoJSONSource | undefined
  const selectedData = transformSelectedSourceOptions({
    selected: item,
    zoom: map.getZoom(),
  }).data as FeatureCollection

  selectedSource?.setData(selectedData)

  const { isInvalidPoint, latitude, longitude } = validatePoint(item?.coordinates ?? null)
  if (!item || isInvalidPoint || !shouldFly) return null

  const zoom = item.coordinateAccuracy ?? defaultZoom
  const flightKey = `${item.id}:${longitude}:${latitude}:${zoom}`
  if (flightKey !== previousFlightKey) {
    mapRef.flyTo({
      center: [longitude, latitude],
      zoom,
      essential: true,
    })
  }

  return flightKey
}
