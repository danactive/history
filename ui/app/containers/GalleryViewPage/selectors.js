import { createSelector } from 'reselect';

// Memorized selectors
const selectPage = state => state.galleryViewPage;

const makeSelectGalleries = () => createSelector(
  selectPage,
  pageState => pageState.albums || [],
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
  makeSelectGalleries,
  makeSelectGalleryLoading,
  makeSelectGalleryError,
};
