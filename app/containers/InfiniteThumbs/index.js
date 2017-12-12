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
import { chooseMemory } from './actions';
import { makeSelectThumbsError } from './selectors';

function showUiError(error) {
  return <div>{`Something went wrong, please try again! Reason (${error.message})`}</div>;
}

function InfiniteThumbs(props) {
  const {
    loading,
    error: albumError,
    items,
    nextPage,
    hasMore,
    selectThumb,
    thumbsError,
  } = props;

  if (albumError !== false) {
    return showUiError(albumError);
  }

  if (thumbsError !== false) {
    return showUiError(thumbsError);
  }

  if (loading) {
    return <LoadingIndicator />;
  }

  const html = items.map((item) => (
    <ThumbImg onClick={() => selectThumb(item.id)} src={item.thumbLink} alt={item.filename} key={`thumb-${item.filename}`} />
  ));

  return (
    <InfiniteScroll
      pageStart={0}
      loadMore={nextPage}
      hasMore={hasMore}
      loader={<LoadingIndicator />}
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
  selectThumb: PropTypes.func.isRequired,
  thumbsError: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.bool,
  ]),
};

const mapStateToProps = createStructuredSelector({
  hasMore: makeSelectMoreThumbs(),
  thumbsError: makeSelectThumbsError(),
});

function mapDispatchToProps(dispatch) {
  return {
    nextPage: () => dispatch(loadNextPage()),
    selectThumb: (id) => dispatch(chooseMemory(id)),
  };
}

const withConnect = connect(mapStateToProps, mapDispatchToProps);

export default compose(
  withConnect,
)(InfiniteThumbs);
