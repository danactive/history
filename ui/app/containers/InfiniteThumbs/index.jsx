import dotProp from 'dot-prop';
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
import { chooseMemory } from '../App/actions';
import { makeSelectThumbsError } from '../App/selectors';
import saga from './saga';

const showAlbumError = (error) => {
  const message = dotProp.get(error, 'ui.title', error.message);
  return <div>{`Something went wrong, please try again! Reason (${message})`}</div>;
};

const showThumbsError = error => <div>{error.ui.title}</div>;

const InfiniteThumbs = (props) => {
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
    <ThumbImg
      alt={item.filename}
      key={`thumb-${item.filename}`}
      onClick={() => selectThumb(item.id)}
      src={item.thumbLink}
    />
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
const withSaga = injectSaga({ key: 'mediaGallery', saga });

export default compose(
  withConnect,
  withSaga,
)(InfiniteThumbs);
