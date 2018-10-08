import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { compose } from 'redux';
import { createStructuredSelector } from 'reselect';

import ListItem from '../../components/ListItem';
import { capitalize } from '../../utils/strings';
import { makeSelectGallery } from './selectors';

function AlbumListItem({ item, gallery }) {
  const content = (
    <Link to={`/album/view/${item.name}?gallery=${gallery}`}>{capitalize(item.name)}</Link>
  );

  return (
    <ListItem key={`albums-list-item-${item.id}`} item={content} />
  );
}

AlbumListItem.propTypes = {
  gallery: PropTypes.string.isRequired,
  item: PropTypes.object.isRequired,
};

const mapStateToProps = createStructuredSelector({
  gallery: makeSelectGallery(),
});

const withConnect = connect(mapStateToProps);

export default compose(
  withConnect,
)(AlbumListItem);
