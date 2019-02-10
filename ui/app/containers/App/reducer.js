import { fromJS } from 'immutable';

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

const albumInitialState = fromJS({
  demo: {
    sample: {
      memories: [],
    },
  },
});

export default function reducer(state = albumInitialState, action) {
  const gallery = state.get('gallery');
  const album = state.get('album');

  switch (action.type) {
    case LOAD_ALBUM: {
      return state
        .set('gallery', action.gallery)
        .set('album', action.album)
        .setIn([action.gallery, action.album, 'memories'], []);
    }

    case LOAD_ALBUM_SUCCESS: {
      return state
        .setIn([gallery, album, 'memories'], action.memories); // memories is an Array (not Immutable)
    }

    case LOAD_THUMBS_SUCCESS:
    case LOAD_NEXT_THUMB_PAGE_SUCCESS: {
      return state
        .setIn(
          [gallery, album, 'memories'],
          insertPage({
            insert: action.newMemories,
            pageSize: PAGE_SIZE,
            page: action.page,
            list: state.getIn([gallery, album, 'memories']),
          }), // memories from insertPage is an Array (not Immutable)
        );
    }

    case CHOOSE_MEMORY: {
      return state
        .set(
          'currentMemory',
          fromJS(
            state
              .getIn([gallery, album, 'memories'])
              .filter(item => item.id === action.id)[0],
          ),
          {},
        );
    }

    case LOAD_PHOTO_SUCCESS: {
      return state
        .setIn(
          ['currentMemory', 'photoLink'],
          action.photoLink,
        );
    }

    case NEXT_MEMORY:
    case PREV_MEMORY: {
      const memories = state.getIn([gallery, album, 'memories']);
      const currentMemoryId = state.getIn(['currentMemory', 'id']) || 0;
      const currentMemoryIndex = memories.findIndex(item => item.id === currentMemoryId);
      let adjacentMemoryIndex = currentMemoryIndex + action.adjacentInt;

      const carouselEnd = adjacentMemoryIndex >= memories.length;
      if (carouselEnd) adjacentMemoryIndex -= memories.length;

      const carouselBegin = adjacentMemoryIndex < 0;
      if (carouselBegin) adjacentMemoryIndex = memories.length + adjacentMemoryIndex;

      const findIndex = memories[adjacentMemoryIndex].id;
      return state
        .set(
          'currentMemory',
          fromJS(
            state
              .getIn([gallery, album, 'memories'])
              .filter(item => item.id === findIndex)[0],
          ),
          {},
        );
    }

    default:
      return state;
  }
}
