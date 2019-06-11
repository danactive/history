import { createSelector } from 'reselect';

// Memorized selectors
const selectPage = state => state.galleryViewPage;

const makeSelectAlbums = () => createSelector(
  selectPage,
  homeState => homeState.albums || [],
);

const makeSelectGalleryLoading = () => createSelector(
  selectPage,
  pageState => pageState.galleryLoading,
);

const makeSelectGalleryError = () => createSelector(
  selectPage,
  pageState => pageState.galleryError,
);

export {
  selectPage,
  makeSelectAlbums,
  makeSelectGalleryLoading,
  makeSelectGalleryError,
};
