import React from 'react';

import OrganizePreviews from '../index';

export default {
  title: 'OrganizePreviews',
  component: OrganizePreviews,
};

export const OrganizePreviewStories = () => {
  // fake data generator
  const getItems = (count) => Array.from({ length: count }, (v, k) => k).map((k) => ({
    id: `item-${k}`,
    content: `item ${k + 1}`,
  }));

  return (
    <OrganizePreviews items={getItems(7)} />
  );
};

OrganizePreviewStories.story = {
  name: 'with text',
};
