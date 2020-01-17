import React from 'react';

function titleCase(str) {
  return str.toLowerCase().split(' ').map(word => (word.charAt(0).toUpperCase() + word.slice(1))).join(' ');
}

function LinkToReference({ reference }) {
  const Hyperlink = ({ url }) => <a href={`${url}${reference[1]}`}>{titleCase(reference[1])}</a>;

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
    description,
    location,
    reference,
  } = currentMemory;

  return [
    <h1 key="headerCity">{city}</h1>,
    <h2 key="headerLocation">{location}</h2>,
    <p key="headerDescription">{description}</p>,
    <p key="reference">
      <LinkToReference reference={reference} />
    </p>,
  ];
}

export default PhotoHeader;
