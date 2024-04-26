import { Draggable, Droppable, type DroppableProvided } from '@hello-pangea/dnd'
import { memo, type CSSProperties } from 'react'

import { type Filesystem } from '../../lib/filesystems'
import PreviewImage from './PreviewImage'
import styles from './styles.module.css'

function dragClass(isDraggingOver: boolean, isDraggingFrom: boolean) {
  if (isDraggingOver) {
    return `${styles.isDraggingOver} ${styles.wrapper}`
  }
  if (isDraggingFrom) {
    return `${styles.isDraggingFrom} ${styles.wrapper}`
  }
  return `${styles.isWithoutDrag} ${styles.wrapper}`
}

// eslint-disable-next-line prefer-arrow-callback
const InnerPreviewColumn = memo(function InnerPreviewColumn(
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
    <div className={styles.dropZone} ref={dropProvided.innerRef}>
      <InnerPreviewColumn items={items} />
      {dropProvided.placeholder}
    </div>
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
  style?: CSSProperties,
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
        <div
          className={dragClass(dropSnapshot.isDraggingOver, Boolean(dropSnapshot.draggingFromThisWith))}
          style={style}
          {...dropProvided.droppableProps}
        >
          <InnerList items={items} dropProvided={dropProvided} />
        </div>
      )}
    </Droppable>
  )
}
