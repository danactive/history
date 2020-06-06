import { createSelector } from 'reselect';

// Memorized selectors
const selectGlobal = (state) => state.global;
const selectPage = (state) => state.albumViewPage;

const makeSelectThumbsLoading = () => createSelector(
  selectPage,
  (pageState) => pageState.thumbsLoading || false,
);

const makeSelectCritical = () => createSelector(
  selectGlobal,
  (globalState) => ({
    host: globalState.host,
    gallery: globalState.gallery,
  }),
);

const makeSelectThumbsError = () => createSelector(
  selectPage,
  (pageState) => pageState.thumbsError,
);

const makeSelectCurrentMemory = () => createSelector(
  selectGlobal,
  (globalState) => ({
    currentMemory: globalState.currentMemory,
    album: globalState.album,
    gallery: globalState.gallery,
    host: globalState.host,
  }),
);

export {
  selectPage,
  makeSelectCritical,
  makeSelectCurrentMemory,
  makeSelectThumbsError,
  makeSelectThumbsLoading,
};
