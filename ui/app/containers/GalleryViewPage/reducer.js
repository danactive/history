import produce from 'immer';
import {
  LOAD_GALLERY,
  LOAD_GALLERY_SUCCESS,
  LOAD_GALLERY_ERROR,
} from './constants';

export const initialState = {
  galleryViewPage: {
    galleryLoading: false,
    galleryError: false,
  },
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
      draft.galleryViewPage.galleryLoading = true;
      draft.galleryViewPage.galleryError = false;
      draft.gallery = action.gallery;
      break;
    }

    case LOAD_GALLERY_SUCCESS: {
      draft.galleryViewPage.galleryLoading = false;
      draft.albums = Array.from(action.galleryXml.getElementsByTagName('album')).map(parseAlbum);
      break;
    }

    case LOAD_GALLERY_ERROR: {
      draft.galleryViewPage.galleryError = action.error;
      draft.galleryViewPage.galleryLoading = false;
      break;
    }
  }
});

export default reducer;
