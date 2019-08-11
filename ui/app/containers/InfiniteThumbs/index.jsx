import dotProp from 'dot-prop';
import React from 'react';
import InfiniteScroll from 'react-infinite-scroller';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { createStructuredSelector } from 'reselect';

import injectReducer from '../../utils/injectReducer';
import injectSaga from '../../utils/injectSaga';

import LoadingIndicator from '../../components/LoadingIndicator';
import ThumbImg from '../../components/ThumbImg';

import { loadNextPage } from '../AlbumViewPage/actions';
import { chooseMemory } from '../App/actions';
import { makeSelectThumbsError } from '../App/selectors';
import saga from './saga';
import { makeSelectMoreThumbs } from './selectors';
import albumReducer from './albumReducer';
import pageReducer from './pageReducer';

const showAlbumError = (error = {}) => {
  const message = dotProp.get(error, 'ui.title', error.message) || 'mystery';
  return <div>{`Something went wrong loading the album, please try again! Reason (${message})`}</div>;
};

const showThumbsError = (error = {}) => {
  const message = dotProp.get(error, 'ui.title', error.message) || 'mystery';
  return <div>{`Something went wrong loading a thumbnail, please try again! Reason (${message})`}</div>;
};

const hasThumbLink = item => item.thumbLink;

const thumbImages = selectThumb => item => (
  <ThumbImg
    alt={item.filename}
    key={`thumb-${item.filename}`}
    onClick={() => selectThumb(item.id)}
    src={item.thumbLink}
  />
);

const InfiniteThumbs = (props) => {
  const {
    error: albumError, // props
    items, // props
    loading, // props
    nextPage, // dispatch
    hasMore, // dispatch
    selectThumb, // state
    thumbsError, // state
  } = props;

  if (albumError !== false) {
    return showAlbumError(albumError);
  }

  if (loading) {
    return <LoadingIndicator />;
  }

  const showThumbImage = thumbImages(selectThumb);
console.log('InfiniteThumbs items', items, items.filter(hasThumbLink));
  const html = items.filter(hasThumbLink).map(showThumbImage);
console.log('InfiniteThumbs html', html);
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
const withAlbumReducer = injectReducer({ key: 'mediaGallery', reducer: albumReducer });
const withPageReducer = injectReducer({ key: 'infiniteThumbs', reducer: pageReducer });
const withSaga = injectSaga({ key: 'mediaGallery', saga });

export default compose(
  withAlbumReducer,
  withPageReducer,
  withConnect,
  withSaga,
)(InfiniteThumbs);
