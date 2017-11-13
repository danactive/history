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
import { createStructuredSelector } from 'reselect';

import ListItem from 'components/ListItem';
import { capitalize } from 'utils/strings';
import { makeSelectGalleryName } from './selectors';

function AlbumListItem({ item, galleryName }) {
  const content = (
    <Link to={`/album/view/${item.name}?gallery=${galleryName}`}>{capitalize(item.name)}</Link>
  );

  return (
    <ListItem key={`albums-list-item-${item.id}`} item={content} />
  );
}

AlbumListItem.propTypes = {
  galleryName: PropTypes.string.isRequired,
  item: PropTypes.object.isRequired,
};

const mapStateToProps = createStructuredSelector({
  galleryName: makeSelectGalleryName(),
});

const withConnect = connect(mapStateToProps);

export default compose(
  withConnect,
)(AlbumListItem);
