import JoyLink from '@mui/joy/Link'
import NextLink from 'next/link'
import { type ReactNode } from 'react'

interface InputProps extends React.ComponentPropsWithoutRef<'a'> {
  children: ReactNode;
  href: string;
}

function Link({ children, href, ...props }: InputProps) {
  return (
    <NextLink href={href}>
      <JoyLink {...props} color='primary'>
        {children}
      </JoyLink>
    </NextLink>
  )
}

export default Link
