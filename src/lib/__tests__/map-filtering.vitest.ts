import { describe, expect, test } from 'vitest'

import { buildSelectableItemIndex, filterItemsByMapBounds, resolveSelectedItemIndex } from '../map-filtering'

describe('map filtering', () => {
  test('filters items to the active bounds when map filtering is enabled', () => {
    const items = [
      { id: '1', coordinates: [10, 10] as [number, number] },
      { id: '2', coordinates: [20, 20] as [number, number] },
      { id: '3', coordinates: [30, 30] as [number, number] },
      { id: '4', coordinates: null },
    ]

    expect(filterItemsByMapBounds(items, true, [[15, 15], [25, 25]])).toEqual([items[1]])
    expect(filterItemsByMapBounds(items, false, [[15, 15], [25, 25]])).toEqual(items)
    expect(filterItemsByMapBounds(items, true, null)).toEqual(items)
  })

  test('indexes items by both id and primary filename', () => {
    const items = [
      { id: '1', filename: ['one.jpg', 'one-alt.jpg'] },
      { id: '2', filename: 'two.jpg' },
      { filename: 'three.jpg' },
    ]

    const index = buildSelectableItemIndex(items)

    expect(index.get('1')).toBe(0)
    expect(index.get('one.jpg')).toBe(0)
    expect(index.get('2')).toBe(1)
    expect(index.get('two.jpg')).toBe(1)
    expect(index.get('three.jpg')).toBe(2)
  })

  test('resolves selected indices from the preferred map before falling back', () => {
    const preferredIndex = new Map<string, number>([['visible', 0]])
    const fallbackIndex = new Map<string, number>([['filtered', 2], ['visible', 9]])

    expect(resolveSelectedItemIndex('visible', preferredIndex, fallbackIndex)).toBe(0)
    expect(resolveSelectedItemIndex('filtered', preferredIndex, fallbackIndex)).toBe(2)
    expect(resolveSelectedItemIndex('missing', preferredIndex, fallbackIndex)).toBeNull()
    expect(resolveSelectedItemIndex(null, preferredIndex, fallbackIndex)).toBeNull()
  })
})
