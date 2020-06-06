import { createSelector } from 'reselect';

// Memorized selectors
export const selectGlobal = (state) => state.global;
export const selectPage = (state) => state.albumViewPage;

export const selectNextPage = createSelector(
  selectGlobal,
  selectPage,
  (globalState, pageState) => {
    const {
      album,
      gallery,
      host,
    } = globalState;

    return {
      memories: globalState[host][gallery][album].memories,
      page: pageState.page,
      host,
      gallery,
      album,
    };
  },
);

export const makeSelectAlbumLoading = () => createSelector(
  selectPage,
  (pageState) => pageState.albumLoading,
);

export const makeSelectAlbumError = () => createSelector(
  selectPage,
  (pageState) => pageState.albumError,
);

export const makeSelectAlbumName = () => createSelector(
  selectGlobal,
  (albumState) => albumState.album,
);

export const makeSelectMemories = () => createSelector(
  selectGlobal,
  (globalState) => {
    const {
      album,
      gallery,
      host,
    } = globalState;

    if (host && gallery && album && globalState[host][gallery][album]) {
      return globalState[host][gallery][album].memories;
    }

    return [];
  },
);

export const makeSelectMoreThumbs = () => createSelector(
  selectPage,
  (pageState) => pageState.hasMore,
);

export const makeSelectCurrentMemory = () => createSelector(
  selectGlobal,
  (globalState) => {
    const {
      currentMemory,
    } = globalState;

    return currentMemory || null;
  },
);
