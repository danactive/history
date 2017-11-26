/*
 *
 * AlbumViewPage reducer
 *
 */

import { fromJS } from 'immutable';

import { normalizeError } from 'utils/error';

import {
  LOAD_ALBUM,
  LOAD_ALBUM_SUCCESS,
  LOAD_ALBUM_ERROR,
  LOAD_THUMB_LINKS_SUCCESS,
  LOAD_THUMB_LINKS_ERROR,
  LOAD_THUMB_LINKS_NEXT,
} from './constants';

const initialState = fromJS({
  albumLoading: false,
  thumbsLoading: false,
  albumError: false,
  thumbsError: false,
});

function albumViewPageReducer(state = initialState, action) {
  switch (action.type) {
    case LOAD_ALBUM:
      return state
        .set('albumLoading', true)
        .set('albumError', false);

    case LOAD_ALBUM_SUCCESS:
      return state
        .set('albumLoading', false)
        .set('thumbsLoading', true)
        .set('thumbs', action.thumbs);

    case LOAD_ALBUM_ERROR:
      return state
        .set('albumError', normalizeError(action.error))
        .set('albumLoading', false);

    case LOAD_THUMB_LINKS_SUCCESS:
    case LOAD_THUMB_LINKS_NEXT:
      return state
        .set('thumbsLoading', false)
        .set('thumbs', action.thumbs)
        .set('page', action.page);

    case LOAD_THUMB_LINKS_ERROR:
      return state
        .set('thumbsError', action.error)
        .set('thumbsLoading', false);

    default:
      return state;
  }
}

export default albumViewPageReducer;
