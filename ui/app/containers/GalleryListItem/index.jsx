import React from 'react';
import { Link } from 'react-router-dom';

import ListItem from '../../components/ListItem';
import capitalize from '../../utils/strings';

function GalleryListItem({ item: { name: gallery, host, id } }) {
  const content = (
    <Link to={`/view/${host}/${gallery}`}>{`${capitalize(gallery)} (${host})`}</Link>
  );

  return (
    <ListItem key={`gallery-list-item-${id}`} item={content} />
  );
}

export default GalleryListItem;
