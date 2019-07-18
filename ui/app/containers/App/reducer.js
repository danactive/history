import produce from 'immer';

import {
  CHOOSE_MEMORY,
  LOAD_PHOTO_SUCCESS,
} from './constants';
import {
  NEXT_MEMORY,
  PREV_MEMORY,
} from '../AlbumViewPage/constants';

// The initial state of the App
export const initialState = {
  gallery: 'demo',
  album: 'sample',
  albums: [],
  demo: {
    sample: {
      memories: [],
    },
  },
};

/* eslint-disable default-case, no-param-reassign */
const appReducer = (state = initialState, action) => produce(state, (draft) => {
  switch (action.type) {
    case CHOOSE_MEMORY: {
      console.error('reducer CHOOSE_MEMORY: state ', state);
      const found = state[state.gallery][state.album].memories.filter(item => item.id === action.id)[0];
      draft.currentMemory = found || {};
      break;
    }

    case LOAD_PHOTO_SUCCESS: {
      draft.currentMemory.photoLink = action.photoLink;
      break;
    }

    case NEXT_MEMORY:
    case PREV_MEMORY: {
      const { memories } = state[state.gallery][state.album];
      const currentMemoryId = state.currentMemory.id || 0;
      const currentMemoryIndex = memories.findIndex(item => item.id === currentMemoryId);
      let adjacentMemoryIndex = currentMemoryIndex + action.adjacentInt;

      const carouselEnd = adjacentMemoryIndex >= memories.length;
      if (carouselEnd) adjacentMemoryIndex -= memories.length;

      const carouselBegin = adjacentMemoryIndex < 0;
      if (carouselBegin) adjacentMemoryIndex = memories.length + adjacentMemoryIndex;

      const findIndex = memories[adjacentMemoryIndex].id;

      const found = state[state.gallery][state.album].memories.filter(item => item.id === findIndex)[0];
      draft.currentMemory = found || {};
    }
  }
});

export default appReducer;
