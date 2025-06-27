'use client'

import { DragDropContext, type DraggableLocation } from '@hello-pangea/dnd'
import type { Dispatch, SetStateAction } from 'react'

import type { Filesystem } from '../../lib/filesystems'
import { groupIntoColumns, reorderOnRelease } from '../../utils/preview'
import ActionButtons from './ActionButtons'
import PreviewColumn from './PreviewColumn'
import styles from './styles.module.css'

export default function OrganizePreviews(
  { items, setItems }:
  { items: Filesystem[], setItems: Dispatch<SetStateAction<Filesystem[] | null>> },
) {
  const columnItems = groupIntoColumns(items)

  function onDragEnd({ source, destination }: { source: DraggableLocation, destination: DraggableLocation | null | undefined }) {
    // dropped nowhere
    if (!destination) {
      return
    }

    setItems(
      reorderOnRelease({
        columnItems,
        source,
        destination,
      }),
    )
  }

  const makeColumn = (columnItem: Filesystem[], index: number) => (
    <div className={styles.column} key={`column-${index}`}>
      <PreviewColumn
        key={`column-${index}`}
        columnId={index.toString()}
        items={columnItem}
      />
    </div>
  )

  return (
    <>
      <ActionButtons items={items} />
      <DragDropContext onDragEnd={({ source, destination }) => onDragEnd({ source, destination })}>
        <div className={styles.horizontalScrollContainer}>
          {columnItems.map(makeColumn)}
        </div>
      </DragDropContext>
    </>
  )
}
