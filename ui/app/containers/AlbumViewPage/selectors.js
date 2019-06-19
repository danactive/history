import { createSelector } from 'reselect';

// Memorized selectors
export const selectMedia = state => state.mediaGallery;
export const selectPage = state => state.mediaGallery.albumViewPage;

export const makeSelectAlbumLoading = () => createSelector(
  selectPage,
  pageState => pageState.albumLoading,
);

export const makeSelectAlbumError = () => createSelector(
  selectPage,
  pageState => pageState.albumError,
);

export const makeSelectAlbumName = () => createSelector(
  selectMedia,
  mediaState => mediaState.album,
);

export const makeSelectMemories = () => createSelector(
  selectMedia,
  (mediaState) => {
    const {
      album,
      gallery,
    } = mediaState;

    return mediaState[gallery][album].memories || [];
  },
);

export const selectNextPage = (state) => {
  const pageState = selectPage(state);
  const mediaState = selectMedia(state);
  const {
    album,
    gallery,
  } = mediaState;

  return {
    album,
    gallery,
    memories: mediaState[gallery][album].memories, // memories is an Array (not Immutable)
    page: pageState.page,
  };
};

export const makeSelectNextPage = () => createSelector(
  selectPage,
  selectMedia,
  selectNextPage,
);

export const makeSelectMoreThumbs = () => createSelector(
  selectPage,
  pageState => pageState.hasMore,
);

export const makeSelectCurrentMemory = () => createSelector(
  selectMedia,
  (mediaState) => {
    const {
      currentMemory,
    } = mediaState;

    return currentMemory || null;
  },
);
