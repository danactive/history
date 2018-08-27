import propTypes from 'prop-types';
import React from 'react';

// Renders an image, enforcing the usage of the alt="" attribute
const Img = ({ alt, className, src }) => <img className={className} src={src} alt={alt} />;

Img.defaultProps = {
  className: null,
};

Img.propTypes = {
  src: propTypes.oneOfType([
    propTypes.string,
    propTypes.object,
  ]).isRequired,
  alt: propTypes.string.isRequired,
  className: propTypes.string,
};

export default Img;
