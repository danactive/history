import { createSelector } from 'reselect';

// Memorized selectors
export const selectPage = (state) => state.get('albumViewPage');
export const selectAlbum = (state) => state.get('albums');

export const makeSelectThumbsLoading = () => createSelector(
  selectPage,
  (pageState) => pageState.get('thumbsLoading') || false
);

export const makeSelectThumbsError = () => createSelector(
  selectPage,
  (pageState) => pageState.get('thumbsError')
);

export const selectGalleryFilename = (state) => {
  const albumState = selectAlbum(state);

  return {
    gallery: albumState.get('gallery'),
    filename: albumState.get('currentMemory').filename,
  };
};
