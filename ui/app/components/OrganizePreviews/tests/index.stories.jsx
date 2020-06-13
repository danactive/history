import React, { useState } from 'react';

import OrganizePreviews from '../index';

export default {
  title: 'OrganizePreviews',
  component: OrganizePreviews,
};

// fake data generator
function getItems(count) {
  return Array.from({ length: count }, (v, k) => k).map((k) => ({
    id: `item-${k}`,
    content: `item ${k + 1}`,
  }));
}

export const WithText = () => {
  const [items, setItems] = useState(getItems(7));

  return (
    <OrganizePreviews items={items} setItems={setItems} />
  );
};
