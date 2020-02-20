import dotProp from 'dot-prop';
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
import { LOAD_GALLERY, LOAD_GALLERY_SUCCESS } from '../GalleryViewPage/constants';

// The initial state of the App
export const initialState = {};

function parseFromNode(ascendant) {
  return (descendant) => {
    const tags = ascendant.getElementsByTagName(descendant);
    if (tags.length === 1) {
      return tags[0].innerHTML;
    }

    return '';
  };
}

function parseAlbum(albumXml) {
  const parseNode = parseFromNode(albumXml);
  return {
    id: parseNode('album_name'),
    name: parseNode('album_name'),
    h1: parseNode('album_h1'),
    h2: parseNode('album_h2'),
    year: parseNode('year'),
    filename: parseNode('filename'),
  };
}

/* eslint-disable default-case, no-param-reassign */
const appReducer = (state = initialState, action) => produce(state, (draft) => {
  switch (action.type) {
    case LOAD_ALBUM: {
      draft.gallery = action.gallery;
      draft.host = action.host;
      draft.album = action.album;

      // if no memories set default
      if (!dotProp.has(state, `${action.host}.${action.gallery}.${action.album}.memories`)) {
        draft[action.host] = {
          [action.gallery]: dotProp.set({}, `${action.album}.memories`, []),
        };
      }
      break;
    }

    case LOAD_ALBUM_SUCCESS: {
      draft[state.host] = dotProp.set({}, `${state.gallery}.${state.album}.memories`, action.memories);
      break;
    }

    case LOAD_THUMBS_SUCCESS:
    case LOAD_NEXT_THUMB_PAGE_SUCCESS: {
      draft[state.host] = dotProp.set({}, `${state.gallery}.${state.album}.memories`, insertPage({
        insert: action.newMemories,
        pageSize: PAGE_SIZE,
        page: action.page,
        list: state[state.host][state.gallery][state.album].memories,
      }));
      break;
    }

    case CHOOSE_MEMORY: {
      const found = state[state.host][state.gallery][state.album].memories.filter(item => item.id === action.id)[0];
      draft.currentMemory = found || {};
      break;
    }

    case LOAD_PHOTO_SUCCESS: {
      draft.currentMemory.photoLink = action.photoLink;
      break;
    }

    case NEXT_MEMORY:
    case PREV_MEMORY: {
      const { memories } = state[state.host][state.gallery][state.album];
      const currentMemoryId = state.currentMemory.id || 0;
      const currentMemoryIndex = memories.findIndex(item => item.id === currentMemoryId);
      let adjacentMemoryIndex = currentMemoryIndex + action.adjacentInt;

      const carouselEnd = adjacentMemoryIndex >= memories.length;
      if (carouselEnd) adjacentMemoryIndex -= memories.length;

      const carouselBegin = adjacentMemoryIndex < 0;
      if (carouselBegin) adjacentMemoryIndex = memories.length + adjacentMemoryIndex;

      const findIndex = memories[adjacentMemoryIndex].id;

      const found = state[state.host][state.gallery][state.album].memories.filter(item => item.id === findIndex)[0];
      draft.currentMemory = found || {};
      break;
    }

    case LOAD_GALLERY: {
      draft.gallery = action.gallery;
      draft.host = action.host;
      break;
    }

    case LOAD_GALLERY_SUCCESS: {
      draft[state.host] = {
        [state.gallery]: {
          albums: Array.from(action.galleryXml.getElementsByTagName('album')).map(parseAlbum),
        },
      };
      break;
    }
  }
});

export default appReducer;
