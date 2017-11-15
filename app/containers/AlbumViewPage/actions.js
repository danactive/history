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
  LOAD_THUMB_LINKS_ERROR,
} from './constants';

function parseQueryString(find, from) {
  return RegExp(`[?&]${find}(=([^&#]*)|&|#|$)`).exec(from)[2];
}

export function loadAlbum(querystring, albumName) {
  return {
    type: LOAD_ALBUM,
    galleryName: parseQueryString('gallery', querystring),
    albumName,
  };
}

export function albumLoaded(thumbs, galleryName) {
  return {
    type: LOAD_ALBUM_SUCCESS,
    thumbs,
    galleryName,
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

export function thumbLinksLoadingError(error) {
  return {
    type: LOAD_THUMB_LINKS_ERROR,
    error,
  };
}
