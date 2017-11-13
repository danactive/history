/**
 *
 * ThumbListItem
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { compose } from 'redux';

import ListItem from 'components/ListItem';

function ThumbListItem({ item }) {
  const content = (
    (item.link) ? <b><a href={item.link}>{item.filename}</a></b> : <b>{item.filename}</b>
  );

  return (
    <ListItem key={`thumbs-list-item-${item.id}`} item={content} />
  );
}

ThumbListItem.propTypes = {
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
)(ThumbListItem);
