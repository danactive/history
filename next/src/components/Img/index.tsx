import Image from 'next/image'

import config from '../../../../config.json'

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
  // Next.js image is now handling alt attribute check
  // if (!alt) console.error('Missing ALT attribute on IMG') // eslint-disable-line no-console
  return <Image className={className} src={src} alt={alt} width={width} height={height} title={title} />
}

export default Img
