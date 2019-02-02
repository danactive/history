/**
 *
 * Img.js
 *
 * Renders an image, enforcing the usage of the alt="" tag
 */

import React from 'react';

function Img(props) {
  return <img className={props.className} src={props.src} alt={props.alt} />;
}

export default Img;
