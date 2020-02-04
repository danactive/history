import produce from 'immer';
import {
  LOAD_GALLERY,
  LOAD_GALLERY_SUCCESS,
  LOAD_GALLERY_ERROR,
} from './constants';

export const initialState = {
  galleryLoading: false,
  galleryError: false,
};

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
const reducer = (state = initialState, action) => produce(state, (draft) => {
  switch (action.type) {
    case LOAD_GALLERY: {
      draft.galleryLoading = true;
      draft.galleryError = false;
      draft.gallery = action.gallery;
      break;
    }

    case LOAD_GALLERY_SUCCESS: {
      draft.galleryLoading = false;
      draft.albums = Array.from(action.galleryXml.getElementsByTagName('album')).map(parseAlbum);
      break;
    }

    case LOAD_GALLERY_ERROR: {
      draft.galleryError = action.error;
      draft.galleryLoading = false;
      break;
    }
  }
});

export default reducer;
