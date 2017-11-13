/**
 *
 * AlbumListItem
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { compose } from 'redux';

import ListItem from 'components/ListItem';

function capitalize(words) {
  return words.replace(/(?:^|\s)\S/g, (a) => a.toUpperCase());
}

function AlbumListItem({ item }) {
  const content = (
    <b>{capitalize(item.name)}</b>
  );

  return (
    <ListItem key={`albums-list-item-${item.id}`} item={content} />
  );
}

AlbumListItem.propTypes = {
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
)(AlbumListItem);
