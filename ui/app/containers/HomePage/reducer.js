import produce from 'immer';

import {
  LOAD_GALLERIES,
  LOAD_GALLERIES_SUCCESS,
  LOAD_GALLERIES_ERROR,
} from './constants';

// The initial state of the App
export const initialState = {
  galleryViewPage: {
    galleryError: false,
    galleryLoading: false,
  },
  gallery: 'demo',
  album: 'sample',
  demo: {
    sample: {
      memories: [],
    },
  },
};

/* eslint-disable default-case, no-param-reassign */
const homeReducer = (state = initialState, action) => produce(state, (draft) => {
  switch (action.type) {
    case LOAD_GALLERIES:
      draft.galleryViewPage.galleryError = false;
      draft.galleryViewPage.galleryLoading = true;
      break;

    case LOAD_GALLERIES_SUCCESS:
      draft.galleryViewPage.galleryLoading = false;
      draft.galleryViewPage.contents = action.galleries.entries;
      break;

    case LOAD_GALLERIES_ERROR:
      draft.galleryViewPage.galleryError = action.error;
      draft.galleryViewPage.galleryLoading = false;
      break;
  }
});

export default homeReducer;
