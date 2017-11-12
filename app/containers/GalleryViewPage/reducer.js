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
    name: parseNode('album_name'),
    h1: parseNode('album_h1'),
    h2: parseNode('album_h2'),
    year: parseNode('year'),
    filename: parseNode('filename'),
  };
}

function galleryViewPageReducer(state = initialState, action) {
  switch (action.type) {
    case LOAD_GALLERY:
      return state
        .set('galleryLoading', true)
        .set('galleryError', false);

    case LOAD_GALLERY_SUCCESS:
      return state
        .set('galleryLoading', false)
        .set('albums', Array.from(action.galleryXml.getElementsByTagName('album')).map(parseAlbum));

    case LOAD_GALLERY_ERROR:
      return state
        .set('galleryError', action.error)
        .set('galleryLoading', false);

    default:
      return state;
  }
}

export default galleryViewPageReducer;
