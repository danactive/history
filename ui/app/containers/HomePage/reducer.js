import produce from 'immer';

import {
  LOAD_GALLERIES,
  LOAD_GALLERIES_SUCCESS,
  LOAD_GALLERIES_ERROR,
} from './constants';

// The initial state of the App
export const initialState = {
  galleryError: false,
  galleryLoading: false,
  galleries: {
    dropbox: [],
    local: [],
  },
};

/* eslint-disable default-case, no-param-reassign */
const homeReducer = (state = initialState, action) => produce(state, (draft) => {
  switch (action.type) {
    case LOAD_GALLERIES:
      draft.galleryError = false;
      draft.galleryLoading = true;
      break;

    case LOAD_GALLERIES_SUCCESS:
      draft.galleryLoading = false;
      if (action.galleries && action.galleries.dropbox && action.galleries.dropbox.entries) {
        draft.galleries.dropbox = action.galleries.dropbox.entries.map(item => ({
          id: item.id,
          name: item.name.replace(/gallery-/gi, ''),
        }));
      }
      if (action.galleries && action.galleries.local) {
        draft.galleries.local = action.galleries.local;
      }
      break;

    case LOAD_GALLERIES_ERROR:
      draft.galleryError = action.error;
      draft.galleryLoading = false;
      break;
  }
});

export default homeReducer;
