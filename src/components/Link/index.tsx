import NextLink from 'next/link'
import { memo, type ReactNode } from 'react'

import styles from './styles.module.css'

interface InputProps extends React.ComponentPropsWithoutRef<'a'> {
  children: ReactNode;
  href: string;
}

function Link({ children, ...props }: InputProps) {
  return (
    <NextLink className={styles.link} {...props}>{children}</NextLink>
  )
}

export default memo(Link)
