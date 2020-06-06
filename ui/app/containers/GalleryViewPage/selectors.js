import { createSelector } from 'reselect';

// Memorized selectors
const selectGlobal = (state) => state.global;
const selectPage = (state) => state.galleryViewPage;

const makeSelectGalleryLoading = () => createSelector(
  selectPage,
  (pageState) => pageState.galleryLoading,
);

const makeSelectGalleryError = () => createSelector(
  selectPage,
  (pageState) => pageState.galleryError,
);

const makeSelectItems = () => createSelector(
  selectGlobal,
  (globalState) => {
    if (globalState
      && globalState[globalState.host]
      && globalState[globalState.host][globalState.gallery]
      && globalState[globalState.host][globalState.gallery].albums) {
      return globalState[globalState.host][globalState.gallery].albums.map((album) => ({ name: album.h1, id: album.id }));
    }
    return [];
  },
);

export {
  selectPage,
  makeSelectGalleryLoading,
  makeSelectGalleryError,
  makeSelectItems,
};
