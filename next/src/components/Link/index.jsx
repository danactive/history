/* eslint-disable react/jsx-props-no-spreading */
import { memo } from 'react'
import NextLink from 'next/link'
import styled from 'styled-components'

const ColouredLink = styled(NextLink)`
  color: #6cc0e5;

  &:hover {
    color: #e6df55;
  }

  &:active {
    color: #999540;
  }

  &:visited {
    color: #e68393;
  }

  &:visited:hover {
    color: #e6df55;
  }
`

function Link({ children, ...props }) {
  return (
    <ColouredLink {...props}>{children}</ColouredLink>
  )
}

export default memo(Link)
