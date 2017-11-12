/*
 * HomeReducer
 *
 * The reducer takes care of our data. Using actions, we can change our
 * application state.
 * To add a new action, add it to the switch statement in the reducer function
 *
 * Example:
 * case YOUR_ACTION_CONSTANT:
 *   return state.set('yourStateVariable', true);
 */
import { fromJS } from 'immutable';

import {
  CHANGE_USERNAME,
  LOAD_GALLERIES,
  LOAD_GALLERIES_SUCCESS,
  LOAD_GALLERIES_ERROR,
} from './constants';

// The initial state of the App
const initialState = fromJS({
  username: '',
  galleryLoading: false,
  galleryError: false,
});

function homeReducer(state = initialState, action) {
  switch (action.type) {
    case CHANGE_USERNAME:
      // Delete prefixed '@' from the github username
      return state
        .set('username', action.name.replace(/@/gi, ''));

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
