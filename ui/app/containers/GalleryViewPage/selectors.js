import { createSelector } from 'reselect';

// Memorized selectors
const selectMedia = state => state.mediaGallery;
const selectPage = state => state.mediaGallery.galleryViewPage;

const makeSelectAlbums = () => createSelector(
  selectMedia,
  mediaState => mediaState.albums || [],
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
  selectMedia,
  selectPage,
  makeSelectAlbums,
  makeSelectGalleryLoading,
  makeSelectGalleryError,
};
