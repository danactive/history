import {
  LOAD_ALBUM,
  LOAD_ALBUM_SUCCESS,
  LOAD_ALBUM_ERROR,
  LOAD_ENOUGH_THUMBS,
  LOAD_NEXT_THUMB_PAGE,
  LOAD_NEXT_THUMB_PAGE_SUCCESS,
  LOAD_NEXT_THUMB_PAGE_ERROR,
  LOAD_THUMBS_SUCCESS,
  CLEAR_MEMORY,
  NEXT_MEMORY,
  PREV_MEMORY,
  SLIDE_TO_MEMORY,
} from './constants';

export function cleanCurrentMemory() {
  return {
    type: CLEAR_MEMORY,
  };
}

export function loadAlbum({ host, gallery, album }) {
  return {
    type: LOAD_ALBUM,
    host,
    gallery,
    album,
  };
}

export function albumLoadSuccess({ memories, host, gallery, album }) {
  return {
    type: LOAD_ALBUM_SUCCESS,
    memories,
    host,
    gallery,
    album,
  };
}

export function albumLoadError(error) {
  return {
    type: LOAD_ALBUM_ERROR,
    error,
  };
}

export function loadNextPage(nextPageNum) {
  return {
    type: LOAD_NEXT_THUMB_PAGE,
    nextPageNum,
  };
}

export function nextPageSuccess({
  newMemories,
  hasMore,
  page,
  host,
  gallery,
  album,
}) {
  return {
    type: LOAD_NEXT_THUMB_PAGE_SUCCESS,
    newMemories,
    page,
    hasMore,
    host,
    gallery,
    album,
  };
}

export function nextPageError(error) {
  return {
    type: LOAD_NEXT_THUMB_PAGE_ERROR,
    error,
  };
}

export function thumbsLoaded({ newMemories, page, host, gallery, album }) {
  return {
    type: LOAD_THUMBS_SUCCESS,
    newMemories,
    page,
    hasMore: false,
    host,
    gallery,
    album,
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

export function slideToAdjacentMemory(index) {
  return {
    type: SLIDE_TO_MEMORY,
    index,
  };
}

export function enoughThumbsLoaded() {
  return {
    type: LOAD_ENOUGH_THUMBS,
  };
}
