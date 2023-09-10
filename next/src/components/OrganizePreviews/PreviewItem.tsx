import React from 'react'
import { type DraggableProvided } from '@hello-pangea/dnd'
import styled from 'styled-components'

import { type Filesystem } from '../../lib/filesystems'

const getBorderColor = (isDragging: boolean) => (isDragging ? '#e6df55' : 'transparent')
const getBackgroundColor = (isDragging: boolean) => (isDragging ? '#877e7a' : 'transparent')

const Container = styled.div<{ $isDragging: boolean }>`
  border: ${(props) => getBorderColor(props.$isDragging)} 5px solid
  background-color: ${(props) => getBackgroundColor(props.$isDragging)}
  box-sizing: border-box
  padding: 4px
`

function getStyle(provided: DraggableProvided, style?: React.CSSProperties) {
  if (!style) {
    return provided.draggableProps.style
  }

  return {
    ...provided.draggableProps.style,
    ...style,
  }
}

function PreviewItem(
  {
    item,
    isDragging,
    provided,
    style,
    index,
  }:
  {
    item: Filesystem,
    isDragging: boolean,
    provided: DraggableProvided,
    style?: React.CSSProperties,
    index: number,
  },
) {
  return (
    <Container
      $isDragging={isDragging}
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      style={getStyle(provided, style)}
      data-is-dragging={isDragging}
      data-index={index}
    >
      {item.label}
    </Container>
  )
}

export default React.memo(PreviewItem)
