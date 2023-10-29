import { DragDropContext, type DraggableLocation } from '@hello-pangea/dnd'
import type { Dispatch, SetStateAction } from 'react'
import styled from 'styled-components'

import type { Filesystem } from '../../lib/filesystems'
import { groupIntoColumns, reorderOnRelease } from '../../utils/preview'
import ActionButtons from './ActionButtons'
import PreviewColumn from './PreviewColumn'

const grid = 4

const Column = styled.div`
  margin: 0 ${grid * 2}px;
`

const HorizontalScrollContainer = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  padding: ${grid}px;
  overflow: auto;
`

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
    <Column key={`column-${index}`}>
      <PreviewColumn
        key={`column-${index}`}
        columnId={index.toString()}
        items={columnItem}
      />
    </Column>
  )

  return (
    <>
      <ActionButtons items={items} />
      <DragDropContext onDragEnd={({ source, destination }) => onDragEnd({ source, destination })}>
        <HorizontalScrollContainer>
          {columnItems.map(makeColumn)}
        </HorizontalScrollContainer>
      </DragDropContext>
    </>
  )
}
