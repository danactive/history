/**
 *
 * AlbumListItem
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { compose } from 'redux';

import ListItem from 'components/ListItem';
import { capitalize } from 'utils/strings';

function AlbumListItem({ item }) {
  const content = (
    // TODO gallery param must be dynamic; search from state route location
    <Link to={`/album/view/${item.name}?gallery=`}>{capitalize(item.name)}</Link>
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
