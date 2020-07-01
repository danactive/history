import { createSelector } from '@reduxjs/toolkit';

// Memorized selectors
const selectGlobal = state => state.global;
const selectPage = state => state.albumViewPage;

const selectThumbsLoading = createSelector(
  [selectPage],
  pageState => pageState.thumbsLoading || false,
);

const selectCritical = createSelector([selectGlobal], globalState => ({
  host: globalState.host,
  gallery: globalState.gallery,
}));

const selectThumbsError = createSelector(
  [selectPage],
  pageState => pageState.thumbsError,
);

const selectCurrentMemory = createSelector([selectGlobal], globalState => ({
  currentMemory: globalState.currentMemory,
  album: globalState.album,
  gallery: globalState.gallery,
  host: globalState.host,
}));

export {
  selectPage,
  selectCritical,
  selectCurrentMemory,
  selectThumbsError,
  selectThumbsLoading,
};
