import { createSelector } from 'reselect';

// Memorized selectors
const selectGlobal = state => state.global;
const selectPage = state => state.galleryViewPage;

const makeSelectAlbums = () => createSelector(
  selectGlobal,
  globalState => globalState.albums || [],
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
  selectGlobal,
  selectPage,
  makeSelectAlbums,
  makeSelectGalleryLoading,
  makeSelectGalleryError,
};
