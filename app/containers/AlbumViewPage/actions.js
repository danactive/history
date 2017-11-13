/*
 *
 * AlbumViewPage actions
 *
 */

import {
  LOAD_ALBUM,
  LOAD_ALBUM_SUCCESS,
  LOAD_ALBUM_ERROR,
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

export function albumLoaded(albumXml) {
  return {
    type: LOAD_ALBUM_SUCCESS,
    albumXml,
  };
}

export function albumLoadingError(error) {
  return {
    type: LOAD_ALBUM_ERROR,
    error,
  };
}
