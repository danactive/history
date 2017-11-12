/*
 *
 * GalleryViewPage reducer
 *
 */

import { fromJS } from 'immutable';
import {
  LOAD_GALLERY,
  LOAD_GALLERY_SUCCESS,
  LOAD_GALLERY_ERROR,
} from './constants';

const initialState = fromJS({
  galleryLoading: false,
  galleryError: false,
});

function galleryViewPageReducer(state = initialState, action) {
  switch (action.type) {
    case LOAD_GALLERY:
      return state
        .set('galleryLoading', true)
        .set('galleryError', false);

    case LOAD_GALLERY_SUCCESS:
      return state
        .set('galleryLoading', false)
        .set('firstAlbumName', action.gallery.getElementsByTagName('album_name')[0].innerHTML);

    case LOAD_GALLERY_ERROR:
      return state
        .set('galleryError', action.error)
        .set('galleryLoading', false);

    default:
      return state;
  }
}

export default galleryViewPageReducer;
