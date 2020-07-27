import React from 'react';
import { DragDropContext } from 'react-beautiful-dnd';
import styled from 'styled-components';

import A from '../A';
import PreviewColumn from './PreviewColumn';

import { resizeDimensions } from '../../../../config.json';
import reorderOnRelease from './reorder';
import { getHostToken } from '../../utils/host';

const CDN_HOST = getHostToken('cdn');

export function DraggableThumb({ item, parentCdnFolder, rootFolder }) {
  const imagePath = rootFolder
    ? `${rootFolder}/${item.filename}`
    : `${CDN_HOST}/${parentCdnFolder}/${item.filename}`;
  return [
    <span key={`label-${item.filename}`}>
      <A href={imagePath} target="_blank" title="View original in new tab">
        {item.filename}
      </A>
    </span>,
    <img
      key={`thumbnail-${item.filename}`}
      alt="No preview yet"
      src={imagePath}
      width={resizeDimensions.preview.width}
      height={resizeDimensions.preview.height}
    />,
  ];
}

const grid = 4;

const Column = styled.div`
  margin: 0 ${grid * 2}px;
`;

const HorizontalScrollContainer = styled.div`
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

function OrganizePreviews({ items, setItems }) {
  if (!items.length || items.length === 0) return null;

  const columnItems = groupIntoColumns(items);

  function onDragEnd({ source, destination }) {
    // dropped nowhere
    if (!destination) {
      return;
    }

    setItems(
      reorderOnRelease({
        columnItems,
        source,
        destination,
      }),
    );
  }

  const makeColumn = columnItemName => (
    <Column key={`column-${columnItemName}`}>
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
