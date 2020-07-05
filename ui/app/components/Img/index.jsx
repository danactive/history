import React from 'react';

function Img({ alt, className, src }) {
  if (!alt) console.error('Missing ALT attribute on IMG'); // eslint-disable-line no-console
  return <img className={className} src={src} alt={alt} />;
}

export default Img;
