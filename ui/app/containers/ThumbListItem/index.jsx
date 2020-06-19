import React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';

import ListItem from '../../components/ListItem';
import ThumbImg from '../../components/ThumbImg';

function ThumbListItem({ item }) {
  const content = item.thumbLink ? (
    <ThumbImg src={item.thumbLink} alt={item.filename} />
  ) : (
    <b>{item.filename}</b>
  );

  return <ListItem key={`thumbs-list-item-${item.id}`} item={content} />;
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
  };
}

const withConnect = connect(null, mapDispatchToProps);

export default compose(withConnect)(ThumbListItem);
