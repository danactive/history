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

export function loadAlbum(albumName) {
  return {
    type: LOAD_ALBUM,
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
