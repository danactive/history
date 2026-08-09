import type { MapRef } from 'react-map-gl/mapbox'

import type { Item } from '../../types/common'
import { validatePoint } from '../SlippyMap/options'

type SyncSelectedMapOptions = {
  mapRef: Pick<MapRef, 'flyTo'>;
  item: Item | null;
  defaultZoom: number;
  shouldFly: boolean;
  previousFlightKey: string | null;
}

/**
 * Start the selected photo's camera animation without touching the static,
 * clustered source. Marker styling is projected by SlippyMap from the same
 * selected ID, preserving the reference clustering semantics.
 */
export function syncSelectedMap({
  mapRef,
  item,
  defaultZoom,
  shouldFly,
  previousFlightKey,
}: SyncSelectedMapOptions): string | null {
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
