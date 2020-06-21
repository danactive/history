import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { compose } from 'redux';
import { createStructuredSelector } from 'reselect';

import ListItem from '../../components/ListItem';
import capitalize from '../../utils/strings';
import { makeSelectCritical } from '../App/selectors';

function AlbumListItem({ item, critical }) {
  if (!item || !critical) {
    return <ListItem key="albums-list-item" item={<div>Invalid album</div>} />;
  }

  const { gallery, host } = critical;

  const content = (
    <Link to={`/view/${host}/${gallery}/${item.id}`}>
      {capitalize(item.name)}
    </Link>
  );

  return <ListItem key={`albums-list-item-${item.id}`} item={content} />;
}

const mapStateToProps = createStructuredSelector({
  critical: makeSelectCritical(),
});

const withConnect = connect(mapStateToProps);

export default compose(withConnect)(AlbumListItem);
