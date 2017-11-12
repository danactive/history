import { createSelector } from 'reselect';

// Memorized selectors
const selectPage = (state) => state.get('galleryViewPage');

const makeSelectFirstAlbumName = () => createSelector(
  selectPage,
  (homeState) => homeState.get('firstAlbumName') || ''
);

const makeSelectGalleryLoading = () => createSelector(
  selectPage,
  (pageState) => pageState.get('galleryLoading')
);

const makeSelectGalleryError = () => createSelector(
  selectPage,
  (pageState) => pageState.get('galleryError')
);

export {
  makeSelectFirstAlbumName,
  makeSelectGalleryLoading,
  makeSelectGalleryError,
};
