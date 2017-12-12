import { fromJS } from 'immutable';

import {
  CHOOSE_MEMORY,
} from './constants';
import {
  LOAD_ALBUM,
  LOAD_ALBUM_SUCCESS,
  LOAD_NEXT_THUMB_PAGE_SUCCESS,
  LOAD_THUMBS_SUCCESS,
} from '../AlbumViewPage/constants';

const albumInitialState = fromJS({
  demo: {
    sample: {
      thumbs: [],
      metaThumbs: [],
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
        .setIn([action.gallery, action.album, 'metaThumbs'], [])
        .setIn([action.gallery, action.album, 'thumbs'], []);

    case LOAD_ALBUM_SUCCESS:
      return state
        .setIn([gallery, album, 'metaThumbs'], action.metaThumbs);

    case LOAD_NEXT_THUMB_PAGE_SUCCESS:
      return state
        .setIn([gallery, album, 'thumbs'], action.thumbs);

    case LOAD_THUMBS_SUCCESS:
      return state
        .setIn([gallery, album, 'thumbs'], action.thumbs)
        .deleteIn([gallery, album, 'metaThumbs']);

    case CHOOSE_MEMORY:
      return state
        .set('currentMemory', state.getIn([gallery, album, 'thumbs']).filter((item) => item.id === action.id)[0] || {});

    default:
      return state;
  }
}
