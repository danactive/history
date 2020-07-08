import React from 'react';

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
  const Hyperlink = ({ url }) => (
    <A href={`${url}${reference[1]}`}>{titleCase(reference[1])}</A>
  );

  if (!reference) return null;

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

function PhotoHeader({ currentMemory }) {
  if (!currentMemory || currentMemory === null) return null;

  const {
    city,
    location,
    reference,
    coordinates: [long, lat],
  } = currentMemory;

  return [
    <h4 key="headerCity">
      {city} (<i>{`${long}, ${lat}`}</i>)
    </h4>,
    <p key="headerLocation">
      {location} <LinkToReference reference={reference} />
    </p>,
  ];
}

export default PhotoHeader;
