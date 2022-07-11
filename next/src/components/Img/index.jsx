import React from 'react'

function Img({
  alt, className, src, width, height,
}) {
  if (!alt) console.error('Missing ALT attribute on IMG') // eslint-disable-line no-console
  // eslint-disable-next-line @next/next/no-img-element
  return <img className={className} src={src} alt={alt} width={width} height={height} />
}

export default Img
