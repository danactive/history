import React from 'react';

function Img({ alt, className, src }) {
  return <img className={className} src={src} alt={alt} />;
}

export default Img;
