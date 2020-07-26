import React, { useState } from 'react';
import { DragDropContext } from 'react-beautiful-dnd';
import styled from 'styled-components';

import PreviewColumn from './PreviewColumn';
import reorderOnRelease from './reorder';

const grid = 4;

const Column = styled.div`
  margin: 0 ${grid * 2}px;
`;

const HorizontalScrollContainer = styled.div`
  background-color: teal;
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  padding: ${grid}px;
  overflow: auto;
`;

function groupIntoColumns(items) {
  const fourth = Math.ceil(items.length / 4);
  const columns = {
    column1: items.slice(0, fourth),
    column2: items.slice(fourth, fourth * 2),
    column3: items.slice(fourth * 2, fourth * 3),
    column4: items.slice(fourth * 3, items.length),
  };

  return columns;
}

function OrganizePreviews({ items: initialItems }) {
  const [columnItems, setColumnItems] = useState(
    groupIntoColumns(initialItems),
  );

  function onDragEnd({ source, destination }) {
    // dropped nowhere
    if (!destination) {
      return;
    }

    setColumnItems(
      reorderOnRelease({
        columnItems,
        source,
        destination,
      }),
    );
  }

  const makeColumn = columnItemName => (
    <Column>
      <PreviewColumn
        key={columnItemName}
        columnId={columnItemName}
        items={columnItems[columnItemName]}
      />
    </Column>
  );

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <HorizontalScrollContainer>
        {Object.keys(columnItems).map(makeColumn)}
      </HorizontalScrollContainer>
    </DragDropContext>
  );
}

export default OrganizePreviews;
