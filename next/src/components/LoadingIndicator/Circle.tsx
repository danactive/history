import styled, { css, keyframes } from 'styled-components'

const circleFadeDelay = keyframes`
  0%,
  39%,
  100% {
    opacity: 0;
  }

  40% {
    opacity: 1;
  }
`

const CirclePrimitive = styled.div<{ delay?: number; rotate?: number }>`
  width: 100%;
  height: 100%;
  position: absolute;
  left: 0;
  top: 0;

  ${({ rotate }) => rotate
    && css`
      -webkit-transform: rotate(${rotate}deg);
      -ms-transform: rotate(${rotate}deg);
      transform: rotate(${rotate}deg);
    `}

  &:before {
    content: '';
    display: block;
    margin: 0 auto;
    width: 15%;
    height: 15%;
    background-color: #999;
    border-radius: 100%;
    animation: ${circleFadeDelay} 1.2s infinite ease-in-out both;

    ${({ delay }) => delay // eslint-disable-line indent
      && css`
        -webkit-animation-delay: ${delay}s;
        animation-delay: ${delay}s;
      `}
  }
`

function Circle({ delay, rotate = 0 }: { delay?: number; rotate?: number }) {
  return <CirclePrimitive data-testid="loader" delay={delay} rotate={rotate} />
}

export default Circle
