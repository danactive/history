import NextLink from 'next/link'
import { memo, type ReactNode } from 'react'

import styles from './styles.module.css'

interface InputGroupProps extends React.ComponentPropsWithoutRef<'a'> {
  children: ReactNode;
  href: string;
}

function Link(
  { children, ...props }:
  InputGroupProps,
) {
  return (
    <NextLink className={styles.link} {...props}>{children}</NextLink>
  )
}

export default memo(Link)
