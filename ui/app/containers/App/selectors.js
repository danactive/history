/**
 * The global state selectors
 */

import { createSelector } from 'reselect';
import { initialState } from './reducer';

// Memorized selectors
const selectAlbum = state => state.mediaGallery.albums || initialState;
const selectPage = state => state.mediaGallery.albumViewPage;

const makeSelectThumbsLoading = () => createSelector(
  selectPage,
  pageState => pageState.thumbsLoading || false,
);

const makeSelectThumbsError = () => createSelector(
  selectPage,
  pageState => pageState.thumbsError,
);

const selectCurrentMemory = (state) => {
  const albumState = selectAlbum(state);
  const { gallery, album, currentMemory } = albumState;

  return {
    gallery,
    album,
    currentMemory: currentMemory || null,
  };
};

export {
  selectAlbum,
  selectPage,
  selectCurrentMemory,
  makeSelectThumbsError,
  makeSelectThumbsLoading,
};
