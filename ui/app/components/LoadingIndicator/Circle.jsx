import React from 'react';
import styled, { keyframes } from 'styled-components';

const circleFadeDelay = keyframes`
  0%,
  39%,
  100% {
    opacity: 0;
  }

  40% {
    opacity: 1;
  }
`;

const Circle = ({ delay, rotate }) => {
  const CirclePrimitive = styled.div`
    width: 100%;
    height: 100%;
    position: absolute;
    left: 0;
    top: 0;
    ${rotate
      && `
      -webkit-transform: rotate(${rotate}deg);
      -ms-transform: rotate(${rotate}deg);
      transform: rotate(${rotate}deg);
    `} &:before {
      content: '';
      display: block;
      margin: 0 auto;
      width: 15%;
      height: 15%;
      background-color: #999;
      border-radius: 100%;
      animation: ${circleFadeDelay} 1.2s infinite ease-in-out both;
      ${delay
        && `
        -webkit-animation-delay: ${delay}s;
        animation-delay: ${delay}s;
      `};
    }
  `;
  return <CirclePrimitive />;
};

export default Circle;
