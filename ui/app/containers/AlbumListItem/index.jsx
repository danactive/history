import React, { memo } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

import ListItem from '../../components/ListItem';
import capitalize from '../../utils/strings';
import { selectCritical } from '../App/selectors';

function AlbumListItem({ item }) {
  const critical = useSelector(selectCritical);
  if (!item || !critical) {
    return <ListItem key="albums-list-item" item={<div>Invalid album</div>} />;
  }

  const { gallery, host } = critical;
  const LinkToAlbum = (
    <Link to={`/view/${host}/${gallery}/${item.id}`}>
      {capitalize(item.name)}
    </Link>
  );

  return <ListItem key={`albums-list-item-${item.id}`} item={LinkToAlbum} />;
}

export default memo(AlbumListItem);
