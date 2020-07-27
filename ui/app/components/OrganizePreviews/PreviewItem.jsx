import React from 'react';
import styled from 'styled-components';

const getBorderColor = isDragging => (isDragging ? '#e6df55' : 'transparent');
const getBackgroundColor = isDragging =>
  isDragging ? '#877e7a' : 'transparent';

const Container = styled.div`
  border: ${props => getBorderColor(props.isDragging)} 5px solid;
  background-color: ${props => getBackgroundColor(props.isDragging)};
  box-sizing: border-box;
  padding: 4px;
`;

function getStyle(provided, style) {
  if (!style) {
    return provided.draggableProps.style;
  }

  return {
    ...provided.draggableProps.style,
    ...style,
  };
}

function PreviewItem({ item, isDragging, provided, style, index }) {
  return (
    <Container
      isDragging={isDragging}
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      style={getStyle(provided, style)}
      data-is-dragging={isDragging}
      data-index={index}
    >
      {item.content}
    </Container>
  );
}

export default React.memo(PreviewItem);
