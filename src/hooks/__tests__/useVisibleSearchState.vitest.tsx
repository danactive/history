import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import useVisibleSearchState from '../useVisibleSearchState'

describe('useVisibleSearchState', () => {
  it('reuses the current displayed items when the next array has the same item identities', () => {
    const first = { id: '1' }
    const second = { id: '2' }
    const visibleItemsRef = { current: [first, second] }

    const { result } = renderHook(() => useVisibleSearchState(
      [first, second],
      [first, second],
      visibleItemsRef,
    ))

    act(() => {
      result.current.setDisplayedItems([first])
    })

    const narrowedItems = result.current.itemsToUse

    act(() => {
      result.current.setDisplayedItems([first])
    })

    expect(result.current.itemsToUse).toBe(narrowedItems)
  })
})
