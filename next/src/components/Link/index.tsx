import NextLink from 'next/link'
import { memo, type ReactNode } from 'react'
import styled from 'styled-components'

const ColouredLink = styled.a`
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

function Link({
  children, href, title = '', ...props
}: {
  children: ReactNode, href: string, title?: string,
}) {
  return (
    <NextLink href={href} {...props} passHref legacyBehavior>
      <ColouredLink title={title}>{children}</ColouredLink>
    </NextLink>
  )
}

export default memo(Link)
