import dotProp from 'dot-prop';
import React from 'react';
import InfiniteScroll from 'react-infinite-scroller';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { useInjectSaga } from 'redux-injectors';
import { createStructuredSelector } from 'reselect';

import LoadingIndicator from '../../components/LoadingIndicator';
import ThumbImg from '../../components/ThumbImg';

import { makeSelectMoreThumbs } from '../AlbumViewPage/selectors';
import { loadNextPage } from '../AlbumViewPage/actions';
import { chooseMemory } from '../App/actions';
import { makeSelectThumbsError } from '../App/selectors';
import saga from './saga';

const showAlbumError = error => {
  const message = dotProp.get(error, 'ui.title', error.message);
  return (
    <div>{`Something went wrong, please try again! Reason (${message})`}</div>
  );
};

const showThumbsError = error => <div>{error.ui.title}</div>;

const InfiniteThumbs = props => {
  useInjectSaga({ key: 'albums', saga });
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

  if (loading || !items.length) {
    return <LoadingIndicator />;
  }

  const hasThumbLink = item => item.thumbLink !== null;

  const thumbImages = (item, index) => (
    <ThumbImg
      alt={item.filename}
      key={`thumb-${item.filename}`}
      onClick={() => selectThumb(item.id, index)}
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
      loader={
        <LoadingIndicator key="loading-indicator-InfiniteScroll-loader" />
      }
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
    nextPage: nextPageNum => dispatch(loadNextPage(nextPageNum)),
    selectThumb: (id, index) => dispatch(chooseMemory({ id, index })),
  };
}

const withConnect = connect(mapStateToProps, mapDispatchToProps);

export default compose(withConnect)(InfiniteThumbs);
