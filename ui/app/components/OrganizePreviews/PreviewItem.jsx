import React from 'react';
import styled from 'styled-components';

const grid = 4;

const getBorderColor = isDragging => (isDragging ? 'red' : 'transparent');

const imageSize = 40;

const borderRadius = 5;

const Container = styled.a`
  border-radius: ${borderRadius}px;
  border: 2px solid transparent;
  border-color: ${props => getBorderColor(props.isDragging)};
  box-sizing: border-box;
  padding: ${grid}px;
  min-height: ${imageSize}px;
  margin-bottom: ${grid}px;
  user-select: none;

  /* anchor overrides */
  color: teal;

  &:hover,
  &:active {
    color: orange;
    text-decoration: none;
  }

  &:focus {
    outline: none;
    border-color: green;
    box-shadow: none;
  }

  /* flexbox */
  display: flex;
`;

const Content = styled.div`
  /* flex child */
  flex-grow: 1;
  /*
    Needed to wrap text in ie11
    https://stackoverflow.com/questions/35111090/why-ie11-doesnt-wrap-the-text-in-flexbox
  */
  flex-basis: 100%;
  /* flex parent */
  display: flex;
  flex-direction: column;
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
      <Content>{item.content}</Content>
    </Container>
  );
}

export default React.memo(PreviewItem);
