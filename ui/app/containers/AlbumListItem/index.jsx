import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { compose } from 'redux';
import { createStructuredSelector } from 'reselect';

import ListItem from '../../components/ListItem';
import capitalize from '../../utils/strings';
import { makeSelectGallery } from './selectors';

const AlbumListItem = ({ item, gallery }) => {
  if (!item || !gallery) {
    return (<ListItem key="albums-list-item" item={<div>Invalid album</div>} />);
  }

  const content = (
    <Link to={`/album/view/${item.name}?gallery=${gallery}`}>{capitalize(item.name)}</Link>
  );

  return (
    <ListItem key={`albums-list-item-${item.id}`} item={content} />
  );
};

const mapStateToProps = createStructuredSelector({
  gallery: makeSelectGallery(),
});

const withConnect = connect(mapStateToProps);

export default compose(
  withConnect,
)(AlbumListItem);
