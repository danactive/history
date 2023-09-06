import NextLink from 'next/link'
import { memo, type ReactNode } from 'react'
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

interface InputGroupProps extends React.ComponentPropsWithoutRef<'a'> {
  children: ReactNode;
  href: string;
}

function Link(
  { children, ...props }:
  InputGroupProps,
) {
  return (
    <ColouredLink {...props}>{children}</ColouredLink>
  )
}

export default memo(Link)
