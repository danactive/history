import React from 'react';

import Link from '../../components/Link';
import ListItem from '../../components/ListItem';

import { capitalize } from '../../utils/strings';
import { hostCase } from '../../utils/host';

function GalleryListItem({ item: { name: gallery, host, id } }) {
  const content = [
    <Link key={`gallery-content-item-${id}`} to={`/view/${host}/${gallery}`}>
      {capitalize(gallery)}
    </Link>,
    `(${hostCase(host)})`,
  ];

  return <ListItem key={`gallery-list-item-${id}`} item={content} />;
}

export default GalleryListItem;
