import { fromJS } from 'immutable';

import {
  LOAD_GALLERIES,
  LOAD_GALLERIES_SUCCESS,
  LOAD_GALLERIES_ERROR,
} from './constants';

// The initial state of the App
export const initialState = fromJS({
  galleryLoading: false,
  galleryError: false,
});

function homeReducer(state = initialState, action) {
  switch (action.type) {
    case LOAD_GALLERIES:
      return state
        .set('galleryLoading', true)
        .set('galleryError', false);

    case LOAD_GALLERIES_SUCCESS:
      return state
        .set('galleryLoading', false)
        .set('contents', action.galleries.entries);

    case LOAD_GALLERIES_ERROR:
      return state
        .set('galleryError', action.error)
        .set('galleryLoading', false);

    default:
      return state;
  }
}

export default homeReducer;
