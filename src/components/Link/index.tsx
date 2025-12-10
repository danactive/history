"use client";

import NextLink, { type LinkProps as NextLinkProps } from "next/link";
import JoyLink, { type LinkProps as JoyLinkProps } from "@mui/joy/Link";

type Props = JoyLinkProps & {
  href: NextLinkProps["href"];
};

export default function Link({ href, children, ...props }: Props) {
  return (
    <JoyLink
      {...props}
      href={href}
      slotProps={{
        root: {
          // applied at runtime (avoids function serialization)
          component: NextLink,
        },
      }}
    >
      {children}
    </JoyLink>
  );
}
