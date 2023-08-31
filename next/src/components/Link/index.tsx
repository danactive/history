import NextLink from 'next/link'
import { memo } from 'react'
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

function Link({ children, href, ...props }) {
  return (
    <ColouredLink href={href} {...props}>{children}</ColouredLink>
  )
}

export default memo(Link)
