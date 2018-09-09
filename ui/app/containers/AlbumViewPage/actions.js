import {
  LOAD_ALBUM,
  LOAD_ALBUM_SUCCESS,
  LOAD_ALBUM_ERROR,
  LOAD_NEXT_THUMB_PAGE,
  LOAD_NEXT_THUMB_PAGE_SUCCESS,
  LOAD_NEXT_THUMB_PAGE_ERROR,
  LOAD_THUMBS_SUCCESS,
  NEXT_MEMORY,
  PREV_MEMORY,
} from './constants';

function parseQueryString(find, from) {
  return RegExp(`[?&]${find}(=([^&#]*)|&|#|$)`).exec(from)[2];
}

export function loadAlbum(querystring, album) {
  return {
    type: LOAD_ALBUM,
    gallery: parseQueryString('gallery', querystring),
    album,
  };
}

export function albumLoadSuccess({ gallery, album, memories }) {
  return {
    type: LOAD_ALBUM_SUCCESS,
    gallery,
    album,
    memories,
  };
}

export function albumLoadError(error) {
  return {
    type: LOAD_ALBUM_ERROR,
    error,
  };
}

export function loadNextPage() {
  return {
    type: LOAD_NEXT_THUMB_PAGE,
  };
}

export function nextPageSuccess({ gallery, album, newMemories, page }) {
  return {
    type: LOAD_NEXT_THUMB_PAGE_SUCCESS,
    gallery,
    album,
    newMemories,
    page,
    hasMore: true,
  };
}

export function nextPageError(error) {
  return {
    type: LOAD_NEXT_THUMB_PAGE_ERROR,
    error,
  };
}

export function thumbsLoaded({ gallery, album, newMemories, page }) {
  return {
    type: LOAD_THUMBS_SUCCESS,
    gallery,
    album,
    newMemories,
    page,
    hasMore: false,
  };
}

export function chooseAdjacentMemory(adjacentInt) {
  if (adjacentInt > 0) {
    return {
      type: NEXT_MEMORY,
      adjacentInt,
    };
  }

  return {
    type: PREV_MEMORY,
    adjacentInt,
  };
}
