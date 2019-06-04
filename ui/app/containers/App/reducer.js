import produce from 'immer';

import {
  CHOOSE_MEMORY,
  LOAD_PHOTO_SUCCESS,
} from './constants';
import {
  LOAD_ALBUM,
  LOAD_ALBUM_SUCCESS,
  LOAD_NEXT_THUMB_PAGE_SUCCESS,
  LOAD_THUMBS_SUCCESS,
  PAGE_SIZE,
  NEXT_MEMORY,
  PREV_MEMORY,
} from '../AlbumViewPage/constants';
import { insertPage } from '../AlbumViewPage/paging';

// The initial state of the App
export const initialState = {
  gallery: 'demo',
  album: 'sample',
  albums: {
    demo: {
      sample: {
        memories: [],
      },
    },
  },
};

/* eslint-disable default-case, no-param-reassign */
const appReducer = (state = initialState, action) => produce(state, (draft) => {
  switch (action.type) {
    case LOAD_ALBUM: {
      draft.gallery = action.gallery;
      draft.album = action.album;
      draft.albums[action.gallery][action.album].memories = [];
      break;
    }

    case LOAD_ALBUM_SUCCESS: {
      draft.albums[state.gallery][state.album].memories = action.memories; // memories is an Array (not Immutable)
      break;
    }

    case LOAD_THUMBS_SUCCESS:
    case LOAD_NEXT_THUMB_PAGE_SUCCESS: {
      draft.albums[state.gallery][state.album].memories = insertPage({
        insert: action.newMemories,
        pageSize: PAGE_SIZE,
        page: action.page,
        list: state.albums[state.gallery][state.album].memories,
      }); // memories from insertPage is an Array (not Immutable)
      break;
    }

    case CHOOSE_MEMORY: {
      const found = state.albums[state.gallery][state.album].memories.filter(item => item.id === action.id)[0];
      draft.currentMemory = found || {};
      break;
    }

    case LOAD_PHOTO_SUCCESS: {
      draft.albums.currentMemory.photoLink = action.photoLink;
      break;
    }

    case NEXT_MEMORY:
    case PREV_MEMORY: {
      const { memories } = state.albums[state.gallery][state.album];
      const currentMemoryId = state.albums.currentMemory.id || 0;
      const currentMemoryIndex = memories.findIndex(item => item.id === currentMemoryId);
      let adjacentMemoryIndex = currentMemoryIndex + action.adjacentInt;

      const carouselEnd = adjacentMemoryIndex >= memories.length;
      if (carouselEnd) adjacentMemoryIndex -= memories.length;

      const carouselBegin = adjacentMemoryIndex < 0;
      if (carouselBegin) adjacentMemoryIndex = memories.length + adjacentMemoryIndex;

      const findIndex = memories[adjacentMemoryIndex].id;

      const found = state.albums[state.gallery][state.album].memories.filter(item => item.id === findIndex)[0];
      draft.albums.currentMemory = found || {};
    }
  }
});

export default appReducer;
