import dotProp from 'dot-prop';
import produce from 'immer';

import normalizeError from '../../utils/error';

import {
  LOAD_ALBUM,
  LOAD_ALBUM_SUCCESS,
  LOAD_ALBUM_ERROR,
  LOAD_NEXT_THUMB_PAGE_SUCCESS,
  LOAD_NEXT_THUMB_PAGE_ERROR,
  LOAD_THUMBS_SUCCESS,
  PAGE_SIZE,
} from './constants';

const initialState = {
  albumViewPage: {
    albumLoading: false,
    albumError: false,
    thumbsLoading: false,
    thumbsError: false,
    comment: 'app set this as a reducer, it overwrites the storybook state',
  },
};

/* eslint-disable default-case, no-param-reassign */
const reducer = (state = initialState, action) => produce(state, (draft) => {
  console.log('PAGE_SIZE', PAGE_SIZE, ' type ', action.type);
  switch (action.type) {
    case LOAD_THUMBS_SUCCESS: {
      // move to infinite thumbs
      console.log('success gallery', state.albums.gallery, 'album', state.albums.album, 'albums', state.albums);
      // draft[action.gallery] = dotProp.set({}, `${action.album}.memories`, insertPage({
      //   insert: action.newMemories,
      //   pageSize: PAGE_SIZE,
      //   page: action.page,
      //   list: state.albums[state.albums.gallery][state.albums.album].memories,
      // }));
      break;
    }

    case LOAD_ALBUM: {
      draft.albumLoading = true;
      draft.albumError = false;
      draft.gallery = action.gallery;
      draft.album = action.album;
      draft[action.gallery] = dotProp.set({}, `${action.album}.memories`, []);
      break;
    }

    case LOAD_ALBUM_SUCCESS: {
      draft.albumLoading = false;
      draft.thumbsLoading = true;
      draft.page = 0;
      draft.hasMore = true;
      draft[action.gallery] = dotProp.set({}, `${action.album}.memories`, action.memories);
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
      console.log('AlbumViewPage reducer LOAD_NEXT_THUMB_PAGE_ERROR', action.error);
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
