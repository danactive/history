import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { compose } from 'redux';

import ListItem from '../../components/ListItem';
import { capitalize } from '../../utils/strings';

function removePrefix(name) {
  return name.replace(/gallery-/gi, '');
}

function GalleryListItem({ item }) {
  const gallery = removePrefix(item.name);
  const content = (
    <Link to={`/gallery/view/${gallery}`}>{capitalize(gallery)}</Link>
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
