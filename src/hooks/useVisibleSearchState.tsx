'use client'

import { useCallback, useEffect, useState } from 'react'

function haveSameItems<ItemType>(left: ItemType[], right: ItemType[]) {
  if (left === right) {
    return true
  }

  if (left.length !== right.length) {
    return false
  }

  return left.every((item, index) => item === right[index])
}

export default function useVisibleSearchState<ItemType>(
  visibleItems: ItemType[],
  visibleItemsRef: { current: ItemType[] },
) {
  const [displayedItems, setDisplayedItems] = useState<ItemType[] | null>(null)

  const setDisplayedItemsStable = useCallback((items: ItemType[]) => {
    setDisplayedItems((previousItems) => (
      previousItems !== null && haveSameItems(previousItems, items) ? previousItems : items
    ))
  }, [])

  const itemsToUse = displayedItems ?? visibleItems

  useEffect(() => {
    visibleItemsRef.current = itemsToUse
  }, [itemsToUse])

  return {
    itemsToUse,
    setDisplayedItems: setDisplayedItemsStable,
    visibleCount: itemsToUse.length,
  }
}
