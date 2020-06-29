import dotProp from 'dot-prop';
import React from 'react';
import InfiniteScroll from 'react-infinite-scroller';
import { useSelector, useDispatch } from 'react-redux';
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

const stateSelector = createStructuredSelector({
  hasMore: makeSelectMoreThumbs(),
  thumbsError: makeSelectThumbsError(),
});

const InfiniteThumbs = ({ items, error: albumError, loading }) => {
  const { hasMore, thumbsError } = useSelector(stateSelector);

  const dispatch = useDispatch();
  const nextPage = nextPageNum => dispatch(loadNextPage(nextPageNum));
  const selectThumb = (id, index) => dispatch(chooseMemory({ id, index }));

  useInjectSaga({ key: 'albums', saga });

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

export default InfiniteThumbs;
