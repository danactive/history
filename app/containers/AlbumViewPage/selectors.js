import { createSelector } from 'reselect';

// Memorized selectors
const selectPage = (state) => state.get('albumViewPage');

const makeSelectThumbs = () => createSelector(
  selectPage,
  (homeState) => homeState.get('thumbs') || []
);

const makeSelectAlbumLoading = () => createSelector(
  selectPage,
  (pageState) => pageState.get('albumLoading')
);

const makeSelectAlbumError = () => createSelector(
  selectPage,
  (pageState) => pageState.get('albumError')
);

const makeSelectThumbsLoading = () => createSelector(
  selectPage,
  (pageState) => pageState.get('thumbsLoading')
);

const makeSelectThumbsError = () => createSelector(
  selectPage,
  (pageState) => pageState.get('thumbsError')
);

export {
  makeSelectThumbs,
  makeSelectAlbumLoading,
  makeSelectAlbumError,
  makeSelectThumbsLoading,
  makeSelectThumbsError,
};
