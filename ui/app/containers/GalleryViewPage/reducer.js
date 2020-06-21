import produce from 'immer';
import {
  LOAD_GALLERY,
  LOAD_GALLERY_SUCCESS,
  LOAD_GALLERY_ERROR,
} from './constants';

export const initialState = {
  galleryLoading: false,
  galleryError: false,
};

/* eslint-disable default-case, no-param-reassign */
const reducer = produce((draft, action) => {
  switch (action.type) {
    case LOAD_GALLERY: {
      draft.galleryLoading = true;
      draft.galleryError = false;
      break;
    }

    case LOAD_GALLERY_SUCCESS: {
      draft.galleryLoading = false;
      break;
    }

    case LOAD_GALLERY_ERROR: {
      draft.galleryError = action.error;
      draft.galleryLoading = false;
      break;
    }
  }
}, initialState);

export default reducer;
