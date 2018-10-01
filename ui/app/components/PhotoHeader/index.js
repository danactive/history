import React from "react";
// import PropTypes from 'prop-types';
// import styled from 'styled-components';

function PhotoHeader({ currentMemory }) {
  if (!currentMemory || currentMemory === null) return null;

  const {
    city,
    description,
    location,
  } = currentMemory;

  return [
    <h1 key="headerCity">{city}</h1>,
    <h2 key="headerLocation">{location}</h2>,
    <p key="headerDescription">{description}</p>,
  ];
}

PhotoHeader.propTypes = {};

export default PhotoHeader;
