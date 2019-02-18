import { createSelector } from 'reselect';

// Memorized selectors
const selectPage = state => state.get('galleryViewPage');

const makeSelectAlbums = () => createSelector(
  selectPage,
  homeState => homeState.get('albums') || [],
);

const makeSelectGalleryLoading = () => createSelector(
  selectPage,
  pageState => pageState.get('galleryLoading'),
);

const makeSelectGalleryError = () => createSelector(
  selectPage,
  pageState => pageState.get('galleryError'),
);

export {
  makeSelectAlbums,
  makeSelectGalleryLoading,
  makeSelectGalleryError,
};
