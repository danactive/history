import propTypes from 'prop-types';
import React from 'react';

// Renders an image, enforcing the usage of the alt="" attribute
const Img = props => <img className={props.className} src={props.src} alt={props.alt} />;

Img.defaultProps = {
  className: null
};

Img.propTypes = {
  src: propTypes.oneOfType([
    propTypes.string,
    propTypes.object
  ]).isRequired,
  alt: propTypes.string.isRequired,
  className: propTypes.string
};

export default Img;
