import React from 'react';

// Renders an image, enforcing the usage of the alt="" attribute
const Img = ({ alt, className, src }) => <img className={className} src={src} alt={alt} />;

export default Img;
