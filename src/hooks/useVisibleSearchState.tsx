'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

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
  filtered: ItemType[],
  initialItems: ItemType[],
  visibleItemsRef: { current: ItemType[] },
) {
  const [displayedItems, setDisplayedItems] = useState<ItemType[]>(initialItems)
  const [visibleCount, setVisibleCount] = useState<number>(filtered.length)

  const setDisplayedItemsStable = useCallback((items: ItemType[]) => {
    setDisplayedItems((previousItems) => (haveSameItems(previousItems, items) ? previousItems : items))
  }, [])

  const setVisibleCountStable = useCallback((count: number) => {
    setVisibleCount((previousCount) => (previousCount === count ? previousCount : count))
  }, [])

  useEffect(() => {
    setVisibleCount((previousCount) => (previousCount === filtered.length ? previousCount : filtered.length))
  }, [filtered.length])

  const itemsToUse = useMemo(
    () => (displayedItems.length ? displayedItems : filtered),
    [displayedItems, filtered],
  )

  useEffect(() => {
    visibleItemsRef.current = itemsToUse
  }, [itemsToUse])

  return {
    itemsToUse,
    setDisplayedItems: setDisplayedItemsStable,
    setVisibleCount: setVisibleCountStable,
    visibleCount,
  }
}
