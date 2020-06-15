import React, { useState } from 'react';

import OrganizePreviews from '../index';

import walkUtils from '../../../containers/Walk/util';

const {
  generateImageFilenames,
} = walkUtils;

export default {
  title: 'OrganizePreviews',
  component: OrganizePreviews,
};

export const WithText = () => {
  // fake data generator
  function getItems(count) {
    return [...Array(count).keys()].map((k) => ({
      id: `item-${k}`,
      content: `item ${k + 1}`,
    }));
  }
  const [items, setItems] = useState(getItems(7));

  return (
    <OrganizePreviews items={items} setItems={setItems} />
  );
};

export const WithFilenames = () => {
  const [items, setItems] = useState(generateImageFilenames(8, 'rawdoc'));

  return (
    <OrganizePreviews items={items} setItems={setItems} />
  );
};
