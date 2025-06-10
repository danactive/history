import Image from 'next/image'

import config from '../../../src/models/config'

function Img({
  alt,
  className,
  src,
  width = config.resizeDimensions.thumb.width,
  height = config.resizeDimensions.thumb.height,
  title,
}: {
  alt: string;
  className?: string;
  src: string;
  width?: number;
  height?: number;
  title?: string;
}) {
  return <Image className={className} src={src} alt={alt} width={width} height={height} title={title} />
}

export default Img
