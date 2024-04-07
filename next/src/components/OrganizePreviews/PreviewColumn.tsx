import React from 'react'
import { Draggable, Droppable, type DroppableProvided } from '@hello-pangea/dnd'
import styled from 'styled-components'

import { type Filesystem } from '../../lib/filesystems'
import PreviewImage from './PreviewImage'

const grid = 4

export const getBackgroundColor = (isDraggingOver: boolean, isDraggingFrom: boolean) => {
  // Colour swatch #545454 compound https://color.adobe.com/create/color-wheel
  if (isDraggingOver) {
    return '#BA8570'
  }
  if (isDraggingFrom) {
    return '#496149'
  }
  return '#545454' // base colour
}

const Wrapper = styled.div<{ $isDraggingOver: boolean, $isDraggingFrom: boolean }>`
  background-color: ${(props) => getBackgroundColor(props.$isDraggingOver, props.$isDraggingFrom)};
  display: flex;
  flex-direction: column;
  padding: ${grid}px;
  border: ${grid}px;
  padding-bottom: 0;
  transition: background-color 0.2s ease, opacity 0.1s ease;
  user-select: none;
  width: 285px;
`

const scrollContainerHeight = 250

const DropZone = styled.div`
  /* stop the list collapsing when empty */
  min-height: ${scrollContainerHeight}px;
  /*
    not relying on the items for a margin-bottom
    as it will collapse when the list is empty
  */
  padding-bottom: ${grid}px;
`

// eslint-disable-next-line prefer-arrow-callback
const InnerPreviewColumn = React.memo(function InnerPreviewColumn(
  { items }:
  { items: Filesystem[] },
) {
  return items.map((item, index) => (
    <Draggable key={item.id} draggableId={item.id} index={index}>
      {(dragProvided, dragSnapshot) => (
        <PreviewImage
          key={item.id}
          item={item}
          index={index}
          isDragging={dragSnapshot.isDragging}
          // isGroupedOver={Boolean(dragSnapshot.combineTargetFor)}
          provided={dragProvided}
        />
      )}
    </Draggable>
  ))
})

function InnerList(
  { items, dropProvided }:
  { items: Filesystem[], dropProvided: DroppableProvided },
) {
  return (
    <DropZone ref={dropProvided.innerRef}>
      <InnerPreviewColumn items={items} />
      {dropProvided.placeholder}
    </DropZone>
  )
}

export default function PreviewColumn({
  ignoreContainerClipping,
  isCombineEnabled,
  columnId = 'LIST',
  style,
  items,
}: {
  ignoreContainerClipping?: boolean,
  isCombineEnabled?: boolean,
  columnId?: string,
  style?: React.CSSProperties,
  items: Filesystem[],
}) {
  return (
    <Droppable
      droppableId={columnId}
      type="card"
      ignoreContainerClipping={ignoreContainerClipping}
      isCombineEnabled={isCombineEnabled}
    >
      {(dropProvided, dropSnapshot) => (
        <Wrapper
          style={style}
          $isDraggingOver={dropSnapshot.isDraggingOver}
          $isDraggingFrom={Boolean(dropSnapshot.draggingFromThisWith)}
          {...dropProvided.droppableProps}
        >
          <InnerList items={items} dropProvided={dropProvided} />
        </Wrapper>
      )}
    </Droppable>
  )
}
