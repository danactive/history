/*
 *
 * AlbumViewPage actions
 *
 */

import {
  LOAD_ALBUM,
  LOAD_ALBUM_SUCCESS,
  LOAD_ALBUM_ERROR,
  LOAD_NEXT_THUMB_PAGE,
  LOAD_NEXT_THUMB_PAGE_SUCCESS,
  LOAD_NEXT_THUMB_PAGE_ERROR,
  LOAD_THUMBS_SUCCESS,
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

export function albumLoadSuccess({ gallery, album, metaThumbs }) {
  return {
    type: LOAD_ALBUM_SUCCESS,
    gallery,
    album,
    metaThumbs,
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

export function nextPageSuccess({ gallery, album, thumbs, metaThumbs, page, hasMore }) {
  return {
    type: LOAD_NEXT_THUMB_PAGE_SUCCESS,
    gallery,
    album,
    thumbs,
    metaThumbs,
    page,
    hasMore,
  };
}

export function nextPageError(error) {
  return {
    type: LOAD_NEXT_THUMB_PAGE_ERROR,
    error,
  };
}

export function thumbsLoaded(thumbs) {
  return {
    type: LOAD_THUMBS_SUCCESS,
    thumbs,
  };
}
