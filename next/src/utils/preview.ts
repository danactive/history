import { type DraggableLocation } from '@hello-pangea/dnd'

import { type Filesystem } from '../models/filesystems'

export function groupIntoColumns(items: Filesystem[]) {
  const IMAGE_PER_COLUMN = 4
  const columnCount = Math.ceil(items.length / IMAGE_PER_COLUMN)

  return [...Array(columnCount).keys()].map((index) => items.slice(IMAGE_PER_COLUMN * index, IMAGE_PER_COLUMN * (index + 1)))
}

export function reorder(list: Filesystem[], startIndex: number, endIndex: number) {
  const result = Array.from(list)
  const [removed] = result.splice(startIndex, 1)
  result.splice(endIndex, 0, removed)

  return result
}

function ungroupToItems(columnItems: Record<number, Filesystem>) {
  return Object.keys(columnItems).reduce(
    (acc, val: any) => acc.concat(columnItems[val]),
    [] as Filesystem[],
  )
}

export function reorderOnRelease(
  { columnItems, source, destination }:
  { columnItems: ReturnType<typeof groupIntoColumns>, source: DraggableLocation, destination: DraggableLocation },
) {
  const current = [...columnItems[Number(source.droppableId)]]
  const next = [...columnItems[Number(destination.droppableId)]]
  const target = current[source.index]

  // moving to same list
  if (source.droppableId === destination.droppableId) {
    const reordered = reorder(current, source.index, destination.index)
    const result = {
      ...columnItems,
      [source.droppableId]: reordered,
    }

    return ungroupToItems(result)
  }

  // moving to different list

  // remove from original
  current.splice(source.index, 1)
  // insert into next
  next.splice(destination.index, 0, target)

  const result = {
    ...columnItems,
    [source.droppableId]: current,
    [destination.droppableId]: next,
  }

  return ungroupToItems(result)
}
