import { getPrimaryFilename } from '../utils'

export type Bounds = [[number, number], [number, number]]

type CoordinateItem = {
  coordinates?: [number, number] | null
}

type SelectableItem = {
  id?: string | null
  filename?: string | string[] | null
}

export function filterItemsByMapBounds<ItemType extends CoordinateItem>(
  items: ItemType[],
  mapFilterEnabled: boolean,
  mapBounds: Bounds | null,
) {
  if (!mapFilterEnabled || !mapBounds) {
    return items
  }

  const [[swLng, swLat], [neLng, neLat]] = mapBounds

  return items.filter((item) => {
    const coords = item.coordinates ?? undefined
    if (!coords) {
      return false
    }

    const [lng, lat] = coords
    return lng >= swLng && lng <= neLng && lat >= swLat && lat <= neLat
  })
}

export function buildSelectableItemIndex<ItemType extends SelectableItem>(items: ItemType[]) {
  const index = new Map<string, number>()

  items.forEach((item, itemIndex) => {
    if (item.id) {
      index.set(item.id, itemIndex)
    }

    const filename = getPrimaryFilename(item.filename)
    if (filename) {
      index.set(filename, itemIndex)
    }
  })

  return index
}

export function resolveSelectedItemIndex(
  selectedId: string | null,
  preferredIndex: Map<string, number>,
  fallbackIndex: Map<string, number>,
) {
  if (!selectedId) {
    return null
  }

  const preferredMatch = preferredIndex.get(selectedId)
  if (preferredMatch !== undefined) {
    return preferredMatch
  }

  const fallbackMatch = fallbackIndex.get(selectedId)
  return fallbackMatch ?? null
}
