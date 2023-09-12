import { type DraggableProvided } from '@hello-pangea/dnd'
import React from 'react'
import styled from 'styled-components'

import config from '../../../../config.json'
import { type Filesystem } from '../../lib/filesystems'
import Img from '../Img'
import Link from '../Link'

const getBorderColor = (isDragging: boolean) => (isDragging ? '#e6df55' : 'transparent')
const getBackgroundColor = (isDragging: boolean) => (isDragging ? '#877e7a' : 'transparent')

function DraggableThumb({ item }: { item: Filesystem }) {
  const { filename, absolutePath } = item
  return (
    <>
      <span key={`label-${filename}`}>
        <Link href={absolutePath} target="_blank" title="View original in new tab">
          {filename}
        </Link>
      </span>
      <Img
        key={`thumbnail-${filename}`}
        alt="No preview yet"
        src={absolutePath}
        width={config.resizeDimensions.preview.width}
        height={config.resizeDimensions.preview.height}
      />
    </>
  )
}

const Container = styled.div<{ $isDragging: boolean }>`
  border: ${(props) => getBorderColor(props.$isDragging)} 5px solid;
  background-color: ${(props) => getBackgroundColor(props.$isDragging)};
  box-sizing: border-box;
  padding: 4px;
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

function PreviewImage(
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
      <DraggableThumb item={item} />
    </Container>
  )
}

export default React.memo(PreviewImage)
