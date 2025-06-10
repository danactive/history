import Image, { type ImageProps } from 'next/image'
import { type RefObject } from 'react'

import config from '../../../src/models/config'

function Img({
  alt,
  className,
  src,
  width = config.resizeDimensions.thumb.width,
  height = config.resizeDimensions.thumb.height,
  title,
  ref,
  ...NextProps
}: ImageProps & {
  className?: string;
  width?: number;
  height?: number;
  title?: string;
  ref?: RefObject<HTMLImageElement | null>
}) {
  return <Image
    className={className}
    src={src}
    alt={alt}
    width={width}
    height={height}
    title={title}
    {...NextProps}
    ref={ref}
  />
}

export default Img
