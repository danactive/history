import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { compose } from 'redux';

import ListItem from '../../components/ListItem';
import capitalize from '../../utils/strings';

function GalleryListItem({ item: { name: gallery, host, id } }) {
  const content = (
    <Link to={`/view/${host}/${gallery}`}>{capitalize(gallery)}</Link>
  );

  return (
    <ListItem key={`gallery-list-item-${id}`} item={content} />
  );
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
  };
}

const withConnect = connect(null, mapDispatchToProps);

export default compose(
  withConnect,
)(GalleryListItem);
