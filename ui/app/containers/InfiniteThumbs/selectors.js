import dotProp from 'dot-prop';
import { createSelector } from 'reselect';

// Memorized selectors
export const selectAlbum = state => state.mediaGallery.albums || [];
export const selectPage = state => state.infiniteThumbs;
export const selectSection = state => state.mediaGallery;

export const makeSelectAlbumName = () => createSelector(
  selectAlbum,
  albumState => albumState.album,
);

export const makeSelectMemories = () => createSelector(
  selectSection,
  (sectionState) => {
    const {
      album,
      gallery,
    } = sectionState;

    return dotProp.get(sectionState, `${gallery}.${album}.memories`, []);
  },
);

export const selectNextPage = (state = {}) => {
  console.log('selectors selectNextPage state ', state);
  const pageState = selectPage(state);
  const albumState = selectAlbum(state);
  console.log('selectors selectNextPage 1 pageState ', pageState, 'albumState', albumState);
  const {
    album,
    gallery,
  } = albumState;
  console.log('selectors selectNextPage 2 gallery ', gallery, 'album', album, 'albumState', albumState);
  return {
    album,
    gallery,
    memories: albumState[gallery][album].memories, // memories is an Array (not Immutable)
    page: pageState.page,
  };
};

export const makeSelectNextPage = () => createSelector(
  selectPage,
  selectAlbum,
  selectNextPage,
);

export const makeSelectMoreThumbs = () => createSelector(
  selectPage,
  pageState => pageState.hasMore,
);

export const makeSelectCurrentMemory = () => createSelector(
  selectAlbum,
  (albumState) => {
    const {
      currentMemory,
    } = albumState;

    return currentMemory || null;
  },
);
// TODO saga, reducers, selectors for Infinite Scroll not only AlbumViewPage
