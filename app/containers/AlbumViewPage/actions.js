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

function parseFromNode(ascendant) {
  return (descendant) => {
    const tags = ascendant.getElementsByTagName(descendant);
    if (tags.length > 0) {
      return tags[0].innerHTML;
    }

    return '';
  };
}

function parseAlbum(albumXml) {
  const parseNode = parseFromNode(albumXml);
  return {
    id: albumXml.getAttribute('id'),
    filename: parseNode('filename'),
    city: parseNode('photo_city'),
    location: parseNode('photo_loc'),
    geo: [parseNode('lon'), parseNode('lat')],
    caption: parseNode('thumb_caption'),
  };
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
    thumbs: Array.from(albumXml.getElementsByTagName('item')).map(parseAlbum),
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
