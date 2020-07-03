import { createSelector } from '@reduxjs/toolkit';

// Memorized selectors
const selectGlobal = state => state.global;
const selectPage = state => state.galleryViewPage;

const selectGalleryLoading = createSelector(
  [selectPage],
  pageState => pageState.galleryLoading,
);

const selectGalleryError = createSelector(
  [selectPage],
  pageState => pageState.galleryError,
);

const selectItems = createSelector([selectGlobal], globalState => {
  if (
    globalState &&
    globalState[globalState.host] &&
    globalState[globalState.host][globalState.gallery] &&
    globalState[globalState.host][globalState.gallery].albums
  ) {
    return globalState[globalState.host][globalState.gallery].albums;
  }
  return [];
});

export { selectPage, selectGalleryLoading, selectGalleryError, selectItems };
