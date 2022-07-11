import React from 'react'
import Image from 'next/image'

const thumbDim = { width: 185, height: 45 }
function Img({
  alt, className, src, width = thumbDim.width, height = thumbDim.height,
}) {
  if (!alt) console.error('Missing ALT attribute on IMG') // eslint-disable-line no-console
  return <Image className={className} src={src} alt={alt} width={width} height={height} />
}

export default Img
