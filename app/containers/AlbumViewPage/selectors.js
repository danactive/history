import { createSelector } from 'reselect';

// Memorized selectors
export const selectPage = (state) => state.get('albumViewPage');
export const selectAlbum = (state) => state.get('albums');

export const makeSelectAlbumLoading = () => createSelector(
  selectPage,
  (pageState) => pageState.get('albumLoading')
);

export const makeSelectAlbumError = () => createSelector(
  selectPage,
  (pageState) => pageState.get('albumError')
);

export const makeSelectThumbs = () => createSelector(
  selectAlbum,
  (albumState) => {
    const gallery = albumState.get('gallery');
    const album = albumState.get('album');

    return albumState.getIn([gallery, album, 'thumbs']) || [];
  }
);

export const makeSelectNextPage = () => createSelector(
  selectPage,
  selectAlbum,
  (pageState, albumState) => {
    const gallery = albumState.get('gallery');
    const album = albumState.get('album');

    return {
      gallery,
      album,
      thumbs: albumState.getIn([gallery, album, 'thumbs']),
      metaThumbs: albumState.getIn([gallery, album, 'metaThumbs']),
      page: pageState.get('page'),
    };
  }
);

export const makeSelectMoreThumbs = () => createSelector(
  selectPage,
  (pageState) => pageState.get('hasMore')
);
