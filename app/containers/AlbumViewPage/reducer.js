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
  LOAD_NEXT_THUMB_PAGE_SUCCESS,
  LOAD_NEXT_THUMB_PAGE_ERROR,
  LOAD_THUMBS_SUCCESS,
} from './constants';

const pageInitialState = fromJS({
  albumLoading: false,
  albumError: false,
  thumbsLoading: false,
  thumbsError: false,
});

export default function reducer(state = pageInitialState, action) {
  switch (action.type) {
    case LOAD_ALBUM:
      return state
        .set('albumLoading', true)
        .set('albumError', false);

    case LOAD_ALBUM_SUCCESS:
      return state
        .set('albumLoading', false)
        .set('thumbsLoading', true)
        .set('page', 0)
        .set('hasMore', true);

    case LOAD_ALBUM_ERROR:
      return state
        .set('albumError', normalizeError(action.error))
        .set('albumLoading', false);

    case LOAD_NEXT_THUMB_PAGE_SUCCESS:
      return state
        .set('thumbsLoading', false)
        .set('page', action.page)
        .set('hasMore', action.hasMore);

    case LOAD_NEXT_THUMB_PAGE_ERROR:
      return state
        .set('thumbsError', action.error)
        .set('thumbsLoading', false);

    case LOAD_THUMBS_SUCCESS:
      return state
        .set('thumbsLoading', false)
        .remove('page')
        .remove('hasMore');

    default:
      return state;
  }
}
