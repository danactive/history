/**
 *
 * InfiniteThumbs
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { createStructuredSelector } from 'reselect';

import InfiniteScroll from 'react-infinite-scroller';
import LoadingIndicator from 'components/LoadingIndicator';
import ThumbImg from 'components/ThumbImg';
import { makeSelectMoreThumbs } from '../AlbumViewPage/selectors';
import { loadNextPage } from '../AlbumViewPage/actions';


function InfiniteThumbs({ loading, error, items, nextPage, hasMore }) {
  if (loading) {
    return <LoadingIndicator />;
  }

  if (error !== false) {
    return <div>{`Something went wrong, please try again! Reason (${error.message})`}</div>;
  }

  const html = items.map((item) => (
    <ThumbImg src={item.link} alt={item.filename} key={`thumb-${item.filename}`} />
  ));

  return (
    <InfiniteScroll
      pageStart={0}
      loadMore={nextPage}
      hasMore={hasMore}
      loader={<div className="loader">Loading ...</div>}
      threshold={500}
    >
      {html}
    </InfiniteScroll>
  );
}

InfiniteThumbs.propTypes = {
  loading: PropTypes.bool,
  error: PropTypes.any,
  items: PropTypes.arrayOf(PropTypes.shape).isRequired,
  hasMore: PropTypes.bool,
  nextPage: PropTypes.func.isRequired,
};

const mapStateToProps = createStructuredSelector({
  hasMore: makeSelectMoreThumbs(),
});

function mapDispatchToProps(dispatch) {
  return {
    nextPage: () => dispatch(loadNextPage()),
  };
}

const withConnect = connect(mapStateToProps, mapDispatchToProps);

export default compose(
  withConnect,
)(InfiniteThumbs);
