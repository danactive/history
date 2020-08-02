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
  const IMAGE_PER_COLUMN = 4;
  const columnCount = Math.ceil(items.length / IMAGE_PER_COLUMN);

  return [...Array(columnCount).keys()].map(index =>
    items.slice(IMAGE_PER_COLUMN * index, IMAGE_PER_COLUMN * (index + 1)),
  );
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

  const makeColumn = (columnItem, index) => (
    <Column key={`column-${index}`}>
      <PreviewColumn
        key={`column-${index}`}
        columnId={index.toString()}
        items={columnItem}
      />
    </Column>
  );

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <HorizontalScrollContainer>
        {columnItems.map(makeColumn)}
      </HorizontalScrollContainer>
    </DragDropContext>
  );
}

export default OrganizePreviews;
