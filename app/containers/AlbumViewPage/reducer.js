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
        .set('gallery', action.gallery)
        .set('metaThumbs', action.metaThumbs)
        .set('thumbs', [])
        .set('page', 1);

    case LOAD_ALBUM_ERROR:
      return state
        .set('albumError', normalizeError(action.error))
        .set('albumLoading', false);

    case LOAD_NEXT_THUMB_PAGE_SUCCESS:
      return state
        .set('thumbsLoading', false)
        .set('thumbs', action.thumbs)
        .set('page', action.page)
        .set('hasMore', action.hasMore);

    case LOAD_NEXT_THUMB_PAGE_ERROR:
      return state
        .set('thumbsError', action.error)
        .set('thumbsLoading', false);

    case LOAD_THUMBS_SUCCESS:
      return state
        .set('thumbsLoading', false)
        .set('thumbs', action.thumbs)
        .remove('metaThumbs')
        .remove('page')
        .remove('hasMore');

    default:
      return state;
  }
}

export default albumViewPageReducer;
