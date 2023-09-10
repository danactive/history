import { DragDropContext, type DraggableLocation } from '@hello-pangea/dnd'
import type { Dispatch, SetStateAction } from 'react'
import styled from 'styled-components'

import config from '../../../../config.json'
import type { Filesystem } from '../../lib/filesystems'
import { groupIntoColumns, reorderOnRelease } from '../../utils/preview'
import Img from '../Img'
import Link from '../Link'
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

export function DraggableThumb({ item }: { item: Filesystem }) {
  const { filename } = item
  if (!filename) throw new ReferenceError('Filename is missing')
  return (
    <>
      <span key={`label-${filename}`}>
        <Link href={filename} target="_blank" title="View original in new tab">
          {filename}
        </Link>
      </span>
      <Img
        key={`thumbnail-${filename}`}
        alt="No preview yet"
        src={filename}
        width={config.resizeDimensions.preview.width}
        height={config.resizeDimensions.preview.height}
      />
    </>
  )
}

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
    <DragDropContext onDragEnd={({ source, destination }) => onDragEnd({ source, destination })}>
      <HorizontalScrollContainer>
        {columnItems.map(makeColumn)}
      </HorizontalScrollContainer>
    </DragDropContext>
  )
}
