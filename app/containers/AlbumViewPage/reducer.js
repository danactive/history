/*
 *
 * AlbumViewPage reducer
 *
 */

import { fromJS } from 'immutable';
import dotProp from 'dot-prop';

import { normalizeError } from 'utils/error';

import {
  LOAD_ALBUM,
  LOAD_ALBUM_SUCCESS,
  LOAD_ALBUM_ERROR,
} from './constants';

const initialState = fromJS({
  albumLoading: false,
  albumError: false,
});

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
    id: parseNode('filename'),
    filename: parseNode('filename'),
    city: parseNode('photo_city'),
    location: parseNode('photo_loc'),
    geo: [parseNode('lon'), parseNode('lat')],
    caption: parseNode('thumb_caption'),
  };
}

function albumViewPageReducer(state = initialState, action) {
  switch (action.type) {
    case LOAD_ALBUM:
      return state
        .set('albumLoading', true)
        .set('albumError', false);

    case LOAD_ALBUM_SUCCESS:
      return state
        .set('albumLoading', false)
        .set('thumbs', Array.from(action.albumXml.getElementsByTagName('item')).map(parseAlbum));

    case LOAD_ALBUM_ERROR:
      return state
        .set('albumError', normalizeError({
          message: dotProp.get(action, 'error.error.error_summary'),
          status: dotProp.get(action, 'error.status'),
          debug: dotProp.get(action, 'error.response.req._data.path'),
        }))
        .set('albumLoading', false);

    default:
      return state;
  }
}

export default albumViewPageReducer;
