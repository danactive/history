import { fromJS } from 'immutable';

import { CHOOSE_MEMORY } from './constants';
import {
  LOAD_ALBUM,
  LOAD_ALBUM_SUCCESS,
  LOAD_NEXT_THUMB_PAGE_SUCCESS,
  LOAD_THUMBS_SUCCESS,
  PAGE_SIZE,
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
    case LOAD_ALBUM:
      return state
        .set('gallery', action.gallery)
        .set('album', action.album)
        .setIn([action.gallery, action.album, 'memories'], []);

    case LOAD_ALBUM_SUCCESS:
      return state
        .setIn([gallery, album, 'memories'], action.memories);

    case LOAD_THUMBS_SUCCESS:
    case LOAD_NEXT_THUMB_PAGE_SUCCESS:
      return state
        .setIn(
          [gallery, album, 'memories'],
          insertPage({
            insert: action.newMemories,
            pageSize: PAGE_SIZE,
            page: action.page,
            list: state.getIn([gallery, album, 'memories']),
          })
        );

    case CHOOSE_MEMORY:
      return state
        .set(
          'currentMemory',
          state
            .getIn([gallery, album, 'memories'])
            .filter((item) => item.id === action.id)[0],
          {}
        );

    default:
      return state;
  }
}
