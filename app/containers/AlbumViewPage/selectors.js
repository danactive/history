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

export {
  makeSelectThumbs,
  makeSelectAlbumLoading,
  makeSelectAlbumError,
};
