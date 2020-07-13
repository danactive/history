import produce from 'immer';

import { hostIndex } from '../../utils/host';
import {
  LOAD_GALLERIES,
  LOAD_GALLERIES_SUCCESS,
  LOAD_GALLERIES_ERROR,
} from './constants';

// The initial state of the HomePage
export const initialState = {
  galleryErrors: [false, false],
  galleryLoadings: [false, false],
  galleries: {
    dropbox: [],
    cdn: [],
  },
};

/* eslint-disable default-case, no-param-reassign */
const homeReducer = (state = initialState, action) =>
  produce(state, draft => {
    switch (action.type) {
      case LOAD_GALLERIES:
        draft.galleryLoadings = [true, true];
        draft.galleryErrors = [false, false];
        break;

      case LOAD_GALLERIES_SUCCESS:
        draft.galleryLoadings[draft.galleryLoadings.indexOf(true)] = false;
        if (
          action.galleries &&
          action.galleries.dropbox &&
          action.galleries.dropbox.entries
        ) {
          draft.galleries.dropbox = action.galleries.dropbox.entries.map(
            item => ({
              id: item.id,
              name: item.name,
            }),
          );
        }
        if (action.galleries && action.galleries.cdn) {
          draft.galleries.cdn = action.galleries.cdn;
        }
        break;

      case LOAD_GALLERIES_ERROR:
        draft.galleryErrors[hostIndex(action.host)] = action.error.message;
        draft.galleryLoadings[draft.galleryLoadings.indexOf(true)] = false;
        draft.galleries[action.host] = []; // clear cache as token removed
        break;
    }
  });

export default homeReducer;
