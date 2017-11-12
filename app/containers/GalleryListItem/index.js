/**
 *
 * GalleryListItem
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { compose } from 'redux';

import ListItem from 'components/ListItem';

function GalleryListItem({ item }) {
  const content = (
    <b>{item.name}</b>
  );

  return (
    <ListItem key={`gallery-list-item-${item.id}`} item={content} />
  );
}

GalleryListItem.propTypes = {
  // dispatch: PropTypes.func.isRequired,
  item: PropTypes.object,
};


function mapDispatchToProps(dispatch) {
  return {
    dispatch,
  };
}

const withConnect = connect(null, mapDispatchToProps);

export default compose(
  withConnect,
)(GalleryListItem);
