import React from 'react';
import PropTypes from 'prop-types';

// Renders an image, enforcing the usage of the alt="" attribute
function Img(props) {
  return (
    <img className={props.className} src={props.src} alt={props.alt} />
  );
}

Img.defaultProps = {
  className: null
};

Img.propTypes = {
  src: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.object
  ]).isRequired,
  alt: PropTypes.string.isRequired,
  className: PropTypes.string
};

export default Img;
