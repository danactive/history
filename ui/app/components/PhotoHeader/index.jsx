import React from 'react';
import styled from 'styled-components';

import A from '../A';

function titleCase(str) {
  return decodeURI(
    str
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' '),
  );
}

function LinkToReference({ reference } = {}) {
  if (!reference) return null;

  const Hyperlink = ({ url }) => (
    <A href={`${url}${reference[1]}`}>{titleCase(reference[1])}</A>
  );

  switch (reference[0]) {
    case 'facebook': {
      return <Hyperlink url="https://www.facebook.com/" />;
    }
    case 'google': {
      return <Hyperlink url="https://www.google.com/search?q=" />;
    }
    case 'wikipedia': {
      return <Hyperlink url="https://en.wikipedia.org/wiki/" />;
    }
    case 'youtube': {
      return <Hyperlink url="https://www.youtube.com/watch?v=" />;
    }
    default: {
      return null;
    }
  }
}

const H4 = styled.h4`
  color: whitesmoke;
`;

const P = styled.p`
  color: silver;
`;

function PhotoHeader({ currentMemory }) {
  if (!currentMemory || currentMemory === null) return null;

  const {
    city,
    location,
    reference,
    coordinates: [long, lat] = ['', ''],
  } = currentMemory;

  return [
    <H4 key="headerCity">
      <b>{city}</b> (<i>{`${long}, ${lat}`}</i>)
    </H4>,
    <P key="headerLocation">
      {location} <LinkToReference reference={reference} />
    </P>,
  ];
}

export default PhotoHeader;
