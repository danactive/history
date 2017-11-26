/*
 *
 * AlbumViewPage actions
 *
 */

import {
  LOAD_ALBUM,
  LOAD_ALBUM_SUCCESS,
  LOAD_ALBUM_ERROR,
  LOAD_THUMB_LINKS_SUCCESS,
  LOAD_THUMB_LINKS_NEXT,
  LOAD_THUMB_LINKS_ERROR,
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

export function albumLoaded(gallery, metaThumbs) {
  return {
    type: LOAD_ALBUM_SUCCESS,
    gallery,
    metaThumbs,
  };
}

export function albumLoadingError(error) {
  return {
    type: LOAD_ALBUM_ERROR,
    error,
  };
}

export function thumbLinksLoaded(thumbs) {
  return {
    type: LOAD_THUMB_LINKS_SUCCESS,
    thumbs,
  };
}

export function thumbLinksNext({ gallery, thumbs, metaThumbs, page }) {
  return {
    type: LOAD_THUMB_LINKS_NEXT,
    gallery,
    thumbs,
    metaThumbs,
    page,
  };
}

export function thumbLinksLoadingError(error) {
  return {
    type: LOAD_THUMB_LINKS_ERROR,
    error,
  };
}
