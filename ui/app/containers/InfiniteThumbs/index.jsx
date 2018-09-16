import dotProp from 'dot-prop';
import PropTypes from 'prop-types';
import React from 'react';
import InfiniteScroll from 'react-infinite-scroller';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { createStructuredSelector } from 'reselect';

import injectSaga from '../../utils/injectSaga';

import LoadingIndicator from '../../components/LoadingIndicator';
import ThumbImg from '../../components/ThumbImg';

import { makeSelectMoreThumbs } from '../AlbumViewPage/selectors';
import { loadNextPage } from '../AlbumViewPage/actions';
import { chooseMemory } from './actions';
import { makeSelectThumbsError } from './selectors';
import saga from './saga';


function showAlbumError(error) {
  const message = dotProp.get(error, 'ui.title', error.message);
  return <div>{`Something went wrong, please try again! Reason (${message})`}</div>;
}

function showThumbsError(error) {
  return <div>{error.ui.title}</div>;
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
    return showAlbumError(albumError);
  }

  if (loading) {
    return <LoadingIndicator />;
  }

  const hasThumbLink = item => item.thumbLink !== null;

  const thumbImages = item => (
    <ThumbImg onClick={() => selectThumb(item.id)} src={item.thumbLink} alt={item.filename} key={`thumb-${item.filename}`} />
  );

  const html = items.filter(hasThumbLink).map(thumbImages);

  if (thumbsError !== false) {
    return (
      <div>
        {html}
        {showThumbsError(thumbsError)}
      </div>
    );
  }

  return (
    <InfiniteScroll
      pageStart={0}
      loadMore={nextPage}
      hasMore={hasMore}
      loader={<LoadingIndicator key="loading-indicator-InfiniteScroll-loader" />}
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
    selectThumb: id => dispatch(chooseMemory(id)),
  };
}

const withConnect = connect(mapStateToProps, mapDispatchToProps);
const withSaga = injectSaga({ key: 'albums', saga });

export default compose(
  withConnect,
  withSaga,
)(InfiniteThumbs);
