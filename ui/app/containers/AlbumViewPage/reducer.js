import produce from 'immer';

import normalizeError from '../../utils/error';

import {
  LOAD_ALBUM,
  LOAD_ALBUM_SUCCESS,
  LOAD_ALBUM_ERROR,
  LOAD_NEXT_THUMB_PAGE_SUCCESS,
  LOAD_NEXT_THUMB_PAGE_ERROR,
  LOAD_THUMBS_SUCCESS,
} from './constants';

const initialState = {
  albumLoading: false,
  albumError: false,
  thumbsLoading: false,
  thumbsError: false,
};

/* eslint-disable default-case, no-param-reassign */
const reducer = (state = initialState, action) => produce(state, (draft) => {
  switch (action.type) {
    case LOAD_ALBUM: {
      draft.albumLoading = true;
      draft.albumError = false;
      break;
    }

    case LOAD_ALBUM_SUCCESS: {
      draft.albumLoading = false;
      draft.thumbsLoading = true;
      draft.page = 0;
      draft.hasMore = true;
      break;
    }

    case LOAD_ALBUM_ERROR: {
      draft.albumError = normalizeError(action.error);
      draft.albumLoading = false;
      break;
    }

    case LOAD_NEXT_THUMB_PAGE_SUCCESS: {
      draft.thumbsLoading = false;
      draft.page = action.page;
      draft.hasMore = action.hasMore;
      break;
    }

    case LOAD_NEXT_THUMB_PAGE_ERROR: {
      draft.thumbsError = action.error;
      draft.thumbsLoading = false;
      break;
    }

    case LOAD_THUMBS_SUCCESS: {
      draft.thumbsLoading = false;
      delete draft.page;
      delete draft.hasMore;
      break;
    }
  }
});

export default reducer;
