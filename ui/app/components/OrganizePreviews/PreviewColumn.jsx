import React from 'react';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import styled from 'styled-components';

import PreviewItem from './PreviewItem';

const grid = 4;

export const getBackgroundColor = (isDraggingOver, isDraggingFrom) => {
  if (isDraggingOver) {
    return 'blue';
  }
  if (isDraggingFrom) {
    return 'green';
  }
  return 'yellow';
};

const Wrapper = styled.div`
  background-color: ${props =>
    getBackgroundColor(props.isDraggingOver, props.isDraggingFrom)};
  display: flex;
  flex-direction: column;
  padding: ${grid}px;
  border: ${grid}px;
  padding-bottom: 0;
  transition: background-color 0.2s ease, opacity 0.1s ease;
  user-select: none;
  width: 250px;
`;

const scrollContainerHeight = 250;

const DropZone = styled.div`
  /* stop the list collapsing when empty */
  min-height: ${scrollContainerHeight}px;
  /*
    not relying on the items for a margin-bottom
    as it will collapse when the list is empty
  */
  padding-bottom: ${grid}px;
`;

const ScrollContainer = styled.div`
  overflow-x: hidden;
  overflow-y: auto;
  max-height: ${scrollContainerHeight}px;
`;

/* stylelint-disable block-no-empty */
const Container = styled.div``;
/* stylelint-enable */

const InnerPreviewColumn = React.memo(function InnerPreviewColumn({ items }) {
  return items.map((item, index) => (
    <Draggable key={item.id} draggableId={item.id} index={index}>
      {(dragProvided, dragSnapshot) => (
        <PreviewItem
          key={item.id}
          item={item}
          isDragging={dragSnapshot.isDragging}
          isGroupedOver={Boolean(dragSnapshot.combineTargetFor)}
          provided={dragProvided}
        />
      )}
    </Draggable>
  ));
});

function InnerList({ items, dropProvided }) {
  return (
    <Container>
      <DropZone ref={dropProvided.innerRef}>
        <InnerPreviewColumn items={items} />
        {dropProvided.placeholder}
      </DropZone>
    </Container>
  );
}

export default function PreviewColumn({
  ignoreContainerClipping,
  internalScroll,
  scrollContainerStyle,
  isCombineEnabled,
  columnId = 'LIST',
  style,
  items,
  useClone,
}) {
  const displayQI = (provided, snapshot, descriptor) => (
    <PreviewItem
      item={items[descriptor.source.index]}
      provided={provided}
      isDragging={snapshot.isDragging}
      isClone
    />
  );

  return (
    <Droppable
      droppableId={columnId}
      type="card"
      ignoreContainerClipping={ignoreContainerClipping}
      isCombineEnabled={isCombineEnabled}
      renderClone={useClone ? displayQI : null}
    >
      {(dropProvided, dropSnapshot) => (
        <Wrapper
          style={style}
          isDraggingOver={dropSnapshot.isDraggingOver}
          isDraggingFrom={Boolean(dropSnapshot.draggingFromThisWith)}
          {...dropProvided.droppableProps}
        >
          {internalScroll ? (
            <ScrollContainer style={scrollContainerStyle}>
              <InnerList items={items} dropProvided={dropProvided} />
            </ScrollContainer>
          ) : (
            <InnerList items={items} dropProvided={dropProvided} />
          )}
        </Wrapper>
      )}
    </Droppable>
  );
}
