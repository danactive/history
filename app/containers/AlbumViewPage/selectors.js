import { createSelector } from 'reselect';

// Memorized selectors
const selectPage = (state) => state.get('albumViewPage');
const selectAlbum = (state) => state.get('albums');

export const makeSelectThumbs = () => createSelector(
  selectAlbum,
  (pageState) => pageState.get('thumbs') || []
);

export const makeSelectAlbumLoading = () => createSelector(
  selectPage,
  (pageState) => pageState.get('albumLoading')
);

export const makeSelectAlbumError = () => createSelector(
  selectPage,
  (pageState) => pageState.get('albumError')
);

export const makeSelectThumbsLoading = () => createSelector(
  selectPage,
  (pageState) => pageState.get('thumbsLoading')
);

export const makeSelectThumbsError = () => createSelector(
  selectPage,
  (pageState) => pageState.get('thumbsError')
);

export const makeSelectNextPage = () => createSelector(
  selectPage,
  selectAlbum,
  (pageState, albumState) => ({
    gallery: pageState.get('gallery'),
    thumbs: albumState.get('thumbs'),
    metaThumbs: albumState.get('metaThumbs'),
    page: pageState.get('page'),
  })
);

export const makeSelectMoreThumbs = () => createSelector(
  selectPage,
  (pageState) => pageState.get('hasMore')
);
