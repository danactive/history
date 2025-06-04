import JoyLink from '@mui/joy/Link'
import NextLink from 'next/link'
import { type ReactNode } from 'react'

interface InputProps extends React.ComponentPropsWithoutRef<'a'> {
  children: ReactNode;
  href: string;
}

function Link({ children, ...props }: InputProps) {
  return (
    <JoyLink {...props} color='primary' component={NextLink}>
      {children}
    </JoyLink>
  )
}

export default Link
